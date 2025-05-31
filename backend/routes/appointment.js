// server/routes/appointment.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Not needed here, but keeping if it was previously imported
const jwt = require('jsonwebtoken'); // Not needed here
const { check, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment'); // Make sure this path is correct
const User = require('../models/User'); // Make sure this path is correct
const auth = require('../middleware/auth');
const twilio = require('twilio');

// Helper function to validate date and time format
const isValidDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false; // Invalid date

    // Simple time format check (e.g., "HH:MM")
    const timeRegex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/;
    if (!timeRegex.test(timeString)) return false;

    return true;
};

// @route   POST api/appointments
// @desc    Book a new REGULAR appointment (Student only)
// @access  Private
router.post(
    '/',
    [
        auth,
        check('mentorId', 'Mentor ID is required').not().isEmpty(),
        check('date', 'Date is required').isISO8601().toDate(), // Ensures valid date format
        check('time', 'Time is required').not().isEmpty(),
        check('notes', 'Notes must be a string').optional().isString()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.user.role !== 'Student') {
            return res.status(403).json({ msg: 'Only students can book appointments' });
        }

        const { mentorId, date, time, notes } = req.body;

        if (!isValidDateTime(date, time)) {
            return res.status(400).json({ msg: 'Invalid date or time format' });
        }

        try {
            // Check if mentor exists and is actually a mentor
            const mentor = await User.findById(mentorId);
            if (!mentor || mentor.role !== 'Mentor') {
                return res.status(404).json({ msg: 'Mentor not found or not a valid mentor' });
            }

            const newAppointment = new Appointment({
                student: req.user.id,
                mentor: mentorId,
                date,
                time,
                type: 'Regular', // Explicitly set type to Regular
                notes
            });

            await newAppointment.save();
            res.json(newAppointment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/appointments/student
// @desc    Get all appointments for the logged-in student (both regular and emergency)
// @access  Private (Student only)
router.get('/student', auth, async (req, res) => {
    if (req.user.role !== 'Student') {
        return res.status(403).json({ msg: 'Access denied. Only students can view their appointments.' });
    }
    try {
        const appointments = await Appointment.find({ student: req.user.id })
            .populate('mentor', 'name email')
            .populate('student', 'name email')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/appointments/mentor
// @desc    Get all REGULAR appointments for the logged-in mentor
// @access  Private (Mentor only)
router.get('/mentor', auth, async (req, res) => {
    if (req.user.role !== 'Mentor') {
        return res.status(403).json({ msg: 'Access denied. Only mentors can view their appointments.' });
    }
    try {
        // Only fetch 'Regular' appointments for the mentor here
        const appointments = await Appointment.find({ mentor: req.user.id, type: 'Regular' })
            .populate('student', 'name email')
            .populate('mentor', 'name email')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/appointments/:id/status
// @desc    Update appointment status (Accept, Reject, Cancel, Complete) and mentor description
// @access  Private (Student can cancel, Mentor can accept/reject/complete)
router.put('/:id/status', auth, async (req, res) => {
    const { status, mentorDescription } = req.body; // NEW: Destructure mentorDescription
    const { id } = req.params;

    if (!['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided' });
    }

    try {
        let appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        // Prevent status changes for Emergency appointments via this route if they are already accepted
        if (appointment.type === 'Emergency' && appointment.status === 'Accepted') {
            return res.status(400).json({ msg: 'Emergency appointments cannot be modified via this route once accepted.' });
        }

        // Students can only cancel their own pending appointment (regular or emergency)
        if (req.user.role === 'Student') {
            if (String(appointment.student) !== req.user.id) {
                return res.status(403).json({ msg: 'Not authorized to modify this appointment' });
            }
            if (status !== 'Cancelled' || appointment.status !== 'Pending') {
                return res.status(400).json({ msg: 'Students can only cancel pending appointments' });
            }
        }
        // Mentor can accept, reject, or complete their own REGULAR appointments
        else if (req.user.role === 'Mentor') {
            if (String(appointment.mentor) !== req.user.id || appointment.type === 'Emergency') {
                return res.status(403).json({ msg: 'Not authorized to modify this appointment or it is an emergency type.' });
            }
            if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
                return res.status(400).json({ msg: 'Mentors can only accept, reject, or complete regular appointments.' });
            }
            // Logic for status transitions
            if (status === 'Accepted' && appointment.status !== 'Pending') {
                return res.status(400).json({ msg: 'Only pending appointments can be accepted' });
            }
            if ((status === 'Rejected' || status === 'Completed') && appointment.status !== 'Accepted') {
                return res.status(400).json({ msg: 'Cannot reject/complete an appointment that is not accepted' });
            }
            // NEW: Update mentorDescription if provided and status is 'Completed'
            if (status === 'Completed' && mentorDescription) {
                appointment.mentorDescription = mentorDescription;
            }
        } else {
            return res.status(403).json({ msg: 'Unauthorized role for this action' });
        }

        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number (e.g., +12345678900)
const helplineNumber = process.env.EMERGENCY_HELPLINE_NUMBER; // The real helpline number you want to call (e.g., +18001234567)

// Ensure Twilio client is initialized
const client = new twilio(accountSid, authToken);


// --- New Route for Emergency Helpline Call ---
router.post('/emergency/call', async (req, res) => {
    try {
        if (!helplineNumber) {
            return res.status(500).json({ msg: 'Emergency helpline number not configured.' });
        }

        // Optional: You might want to log who initiated the call
        console.log(`User ${req.user.id} (${req.user.email}) is requesting an emergency call.`);

        // Initiate the call using Twilio
        const call = await client.calls.create({
            url: process.env.TWILIO_TWIML_BIN_URL, // Use the TwiML Bin URL you created
            to: helplineNumber,
            from: twilioPhoneNumber,
        });

        console.log(`Emergency call initiated: ${call.sid}`);
        res.status(200).json({ msg: 'Emergency helpline call initiated successfully!', callSid: call.sid });

    } catch (error) {
        console.error('Error initiating emergency call:', error);
        res.status(500).json({ msg: 'Failed to initiate emergency helpline call.', error: error.message });
    }
});

// --- Modify createEmergencyAppointment (if it's in the same file) ---
// You already have this, but I'm including it to show how the call might integrate
router.post('/appointments/emergency', async (req, res) => {
    try {
        // Your existing logic to find available mentors and create emergency appointment
        // ... (this part of your code is already in your backend)
        
        // Example: Finding a mentor and creating an appointment
        const availableMentor = await User.findOne({ role: 'Mentor', isAvailable: true });
        if (!availableMentor) {
            // If no mentors are available to book an appointment with, we still want to make the call
            // You might choose to send a specific message here
            const callResponse = await axios.post('http://localhost:5001/api/utils/emergency/call');
            return res.status(202).json({ 
                msg: 'No immediate mentor available for booking, but emergency call initiated.',
                callStatus: callResponse.data.msg
            });
        }

        const newAppointment = new Appointment({
            student: req.user.id,
            mentor: availableMentor._id,
            type: 'Emergency',
            date: new Date(), // Current date/time
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Pending', // Or 'Accepted' if it's auto-accepted
        });

        await newAppointment.save();

        // Optional: Notify the mentor (e.g., via email, push notification, or Twilio SMS)
        // client.messages.create({
        //     body: `Emergency request from ${req.user.name}. Please check your dashboard.`,
        //     to: availableMentor.phone, // Assuming mentors have a phone number
        //     from: twilioPhoneNumber
        // }).then(message => console.log(`SMS sent to mentor: ${message.sid}`));


        // After successfully creating the emergency appointment,
        // ALSO trigger the Twilio call.
        // It's often better to make a separate API call from the frontend
        // for the Twilio call, or you can do it here if you prefer.
        // For simplicity and clearer separation of concerns, I've left the call initiation
        // as a separate endpoint, which the frontend will call *after* the appointment request.
        
        res.status(201).json({ msg: 'Emergency appointment requested successfully!', appointment: newAppointment });

    } catch (error) {
        console.error('Error creating emergency appointment:', error);
        res.status(500).json({ msg: 'Server error during emergency appointment creation.' });
    }
});


module.exports = router;

