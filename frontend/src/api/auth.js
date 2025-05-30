// client/src/api/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth'; // Backend URL

export const register = async (userData) => {
    try {
        const res = await axios.post(`${API_URL}/register`, userData);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const login = async (userData) => {
    try {
        const res = await axios.post(`${API_URL}/login`, userData);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getUserData = async (token) => {
    try {
        const res = await axios.get(`${API_URL}/user`, {
            headers: {
                'x-auth-token': token
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};
