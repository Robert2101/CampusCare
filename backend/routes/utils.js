// server/routes/utils.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Simple in-memory cache for the daily tip
let cachedTip = null;
let lastFetchTime = 0;
// Changed CACHE_DURATION to 10 seconds for frequent testing.
// For a real application, you might want this to be 24 * 60 * 60 * 1000 (24 hours)
// or a duration that respects the external API's rate limits and your desired refresh rate.
const CACHE_DURATION = 10 * 1000; // 10 seconds in milliseconds

// @route   GET api/utils/daily-tip
// @desc    Get a daily mental health tip (motivational quote)
// @access  Public (can be accessed by anyone, but we'll call it from student dashboard)
router.get('/daily-tip', async (req, res) => {
    // Check if cached tip is still valid
    if (cachedTip && (Date.now() - lastFetchTime < CACHE_DURATION)) {
        console.log('Serving daily tip from cache.');
        return res.json(cachedTip);
    }

    try {
        const response = await axios.get('https://zenquotes.io/api/random');
        if (response.data && response.data.length > 0) {
            cachedTip = response.data[0]; // ZenQuotes returns an array
            lastFetchTime = Date.now();
            console.log('Fetched new daily tip from ZenQuotes.io');
            res.json(cachedTip);
        } else {
            res.status(404).json({ msg: 'No tip found from external API.' });
        }
    } catch (err) {
        console.error('Error fetching daily tip from ZenQuotes:', err.message);
        // Fallback or send a generic error if external API fails
        res.status(500).json({ msg: 'Failed to fetch daily tip. Please try again later.' });
    }
});

module.exports = router;
