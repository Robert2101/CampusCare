// server/models/Appointment.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor: { // Made optional for emergency appointments
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // IMPORTANT: Set to false to allow null for emergency requests
    },
    date: { // Date of the appointment
        type: Date,
        required: true
    },
    time: { // Time of the appointment (e.g., "10:00 AM", "14:30", or "ASAP")
        type: String,
        required: true
    },
    type: { // NEW: To distinguish between regular and emergency appointments
        type: String,
        enum: ['Regular', 'Emergency'],
        default: 'Regular'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    notes: { // Optional notes for the appointment
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
