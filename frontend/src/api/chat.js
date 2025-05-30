// client/src/api/chat.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/chat'; // Backend URL

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

export const getMentors = async () => {
    try {
        const res = await axios.get(`${API_URL}/mentors`, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const sendMessage = async (receiverId, content, isAnonymous = false) => {
    try {
        const res = await axios.post(`${API_URL}/message`, { receiverId, content, isAnonymous }, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getChatHistory = async (receiverId) => {
    try {
        const res = await axios.get(`${API_URL}/${receiverId}`, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getConversations = async () => {
    try {
        const res = await axios.get(`${API_URL}/conversations`, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};
