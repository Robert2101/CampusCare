// server/routes/appointment.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Not needed here, but keeping if it was previously imported
const jwt = require('jsonwebtoken'); // Not needed here
const { check, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment'); // Make sure this path is correct
const User = require('../models/User'); // Make sure this path is correct
const auth = require('../middleware/auth');

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
// @desc    Update appointment status (Accept, Reject, Cancel, Complete)
// @access  Private (Student can cancel, Mentor can accept/reject/complete)
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
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
        // Emergency appointments are handled by a separate accept route
        else if (req.user.role === 'Mentor') {
            if (String(appointment.mentor) !== req.user.id || appointment.type === 'Emergency') {
                return res.status(403).json({ msg: 'Not authorized to modify this appointment or it is an emergency type.' });
            }
            if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
                return res.status(400).json({ msg: 'Mentors can only accept, reject, or complete regular appointments.' });
            }
            // Logic for status transitions (optional but good practice)
            if (status === 'Accepted' && appointment.status !== 'Pending') {
                return res.status(400).json({ msg: 'Only pending appointments can be accepted' });
            }
            if ((status === 'Rejected' || status === 'Completed') && appointment.status === 'Pending') {
                return res.status(400).json({ msg: 'Cannot reject/complete a pending appointment directly' });
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

module.exports = router;
