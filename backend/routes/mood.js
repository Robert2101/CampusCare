// server/routes/mood.js
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const MoodEntry = require('../models/MoodEntry');

console.log('[mood.js] Mood routes file loaded.'); // DEBUG LOG

// @route   POST api/mood/entry
// @desc    Log a new daily mood entry
// @access  Private (Student only)
router.post(
    '/entry',
    [
        auth,
        check('date', 'Date is required and must be a valid date').isISO8601().toDate(),
        check('moodRating', 'Mood rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
        check('journalEntry', 'Journal entry must be a string').optional().isString()
    ],
    async (req, res) => {
        console.log('[mood.js] POST /api/mood/entry hit.'); // DEBUG LOG
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (req.user.role !== 'Student') {
            return res.status(403).json({ msg: 'Only students can log mood entries' });
        }

        const { date, moodRating, journalEntry } = req.body;

        try {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);

            let existingEntry = await MoodEntry.findOne({
                student: req.user.id,
                date: startOfDay
            });

            if (existingEntry) {
                existingEntry.moodRating = moodRating;
                existingEntry.journalEntry = journalEntry;
                await existingEntry.save();
                return res.json({ msg: 'Mood entry updated successfully', entry: existingEntry });
            } else {
                const newEntry = new MoodEntry({
                    student: req.user.id,
                    date: startOfDay,
                    moodRating,
                    journalEntry
                });
                await newEntry.save();
                return res.json({ msg: 'Mood entry logged successfully', entry: newEntry });
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/mood/entries
// @desc    Get mood entries for the logged-in student, optionally by date range
// @access  Private (Student only)
router.get('/entries', auth, async (req, res) => {
    console.log('[mood.js] GET /api/mood/entries hit.'); // DEBUG LOG
    if (req.user.role !== 'Student') {
        return res.status(403).json({ msg: 'Access denied. Only students can view their mood entries.' });
    }

    const { startDate, endDate } = req.query;
    let query = { student: req.user.id };

    if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        query.date = { ...query.date, $gte: start };
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        query.date = { ...query.date, $lte: end };
    }

    try {
        const entries = await MoodEntry.find(query).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; // THIS LINE IS ABSOLUTELY CRUCIAL!
