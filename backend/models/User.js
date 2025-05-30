
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Basic validation for university email (e.g., @srmap.edu.in)
        // You might want to make this more robust based on actual university domains
        match: [/^[a-zA-Z0-9._%+-]+@srmap\.edu\.in$/, 'Please use a valid @srmap.edu.in email address']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Student', 'Mentor'], // Role-based access
        default: 'Student'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
