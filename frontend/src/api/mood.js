// client/src/api/mood.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/mood'; // Backend URL

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

export const logMoodEntry = async (date, moodRating, journalEntry) => {
    try {
        const res = await axios.post(`${API_URL}/entry`, { date, moodRating, journalEntry }, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getMoodEntries = async (startDate = null, endDate = null) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const res = await axios.get(`${API_URL}/entries`, {
            headers: {
                'x-auth-token': getToken()
            },
            params: params
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};
