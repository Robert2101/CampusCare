// server/models/MoodEntry.js
const mongoose = require('mongoose');

const MoodEntrySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { // The date the mood entry was recorded for (e.g., YYYY-MM-DD)
        type: Date,
        required: true
    },
    moodRating: { // A numerical rating for mood (e.g., 1-5, 1=very bad, 5=very good)
        type: Number,
        required: true,
        min: 1,
        max: 5 // Assuming a 1-5 scale for emojis/ratings
    },
    journalEntry: { // Optional text journal entry
        type: String
    },
    createdAt: { // Timestamp when this entry was actually created in the database
        type: Date,
        default: Date.now
    }
});

// Ensure only one mood entry per student per day
MoodEntrySchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
