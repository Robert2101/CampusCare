// server/routes/emergencyAppointment.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// @route   POST api/emergency-appointments
// @desc    Student creates an emergency appointment request
// @access  Private (Student only)
router.post(
    '/',
    [
        auth,
        check('notes', 'Notes must be a string').optional().isString()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.user.role !== 'Student') {
            return res.status(403).json({ msg: 'Only students can create emergency requests' });
        }

        const { notes } = req.body;

        try {
            // Create a new emergency appointment
            const newEmergencyAppointment = new Appointment({
                student: req.user.id,
                mentor: null, // Initially unassigned
                date: new Date(), // Set date to now
                time: 'ASAP', // Indicate immediate need
                type: 'Emergency',
                status: 'Pending',
                notes: notes || 'Emergency support requested.' // Default note if none provided
            });

            await newEmergencyAppointment.save();
            res.status(201).json(newEmergencyAppointment);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/emergency-appointments/:id/accept
// @desc    Mentor accepts a pending emergency appointment (first-come, first-served)
// @access  Private (Mentor only)
router.put('/:id/accept', auth, async (req, res) => {
    if (req.user.role !== 'Mentor') {
        return res.status(403).json({ msg: 'Only mentors can accept emergency requests' });
    }

    const { id } = req.params;

    try {
        // Find the appointment and update it atomically
        // This ensures that only one mentor can change its status from 'Pending'
        const acceptedAppointment = await Appointment.findOneAndUpdate(
            {
                _id: id,
                type: 'Emergency',
                status: 'Pending', // Crucial: only accept if it's still pending
                mentor: null // Crucial: only accept if it's still unassigned
            },
            {
                $set: {
                    mentor: req.user.id,
                    status: 'Accepted'
                }
            },
            { new: true } // Return the updated document
        ).populate('student', 'name email'); // Populate student details for response

        if (!acceptedAppointment) {
            return res.status(404).json({ msg: 'Emergency request not found or already accepted/cancelled.' });
        }

        res.json(acceptedAppointment);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/emergency-appointments/pending-for-mentors
// @desc    Get all pending emergency appointments (for mentors to see)
// @access  Private (Mentor only)
router.get('/pending-for-mentors', auth, async (req, res) => {
    if (req.user.role !== 'Mentor') {
        return res.status(403).json({ msg: 'Access denied. Only mentors can view pending emergency requests.' });
    }
    try {
        const pendingEmergencies = await Appointment.find({
            type: 'Emergency',
            status: 'Pending',
            mentor: null // Only show unassigned ones
        }).populate('student', 'name email')
          .sort({ createdAt: 1 }); // Sort by oldest first
        res.json(pendingEmergencies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
