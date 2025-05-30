// client/src/api/appointment.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/appointments'; // Base URL for regular appointments
const EMERGENCY_API_URL = 'http://localhost:5001/api/emergency-appointments'; // Base URL for emergency appointments

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// --- Regular Appointments ---
export const bookAppointment = async (mentorId, date, time, notes) => {
    try {
        const res = await axios.post(API_URL, { mentorId, date, time, notes }, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getStudentAppointments = async () => {
    try {
        // This route will now fetch both regular and emergency appointments for the student
        const res = await axios.get(`${API_URL}/student`, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getMentorAppointments = async () => {
    try {
        // This route now only fetches regular appointments for the mentor
        const res = await axios.get(`${API_URL}/mentor`, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
    try {
        const res = await axios.put(`${API_URL}/${appointmentId}/status`, { status }, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// --- Emergency Appointments ---
export const createEmergencyAppointment = async (notes) => {
    try {
        const res = await axios.post(EMERGENCY_API_URL, { notes }, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const getPendingEmergencyAppointmentsForMentors = async () => {
    try {
        const res = await axios.get(`${EMERGENCY_API_URL}/pending-for-mentors`, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

export const acceptEmergencyAppointment = async (appointmentId) => {
    try {
        const res = await axios.put(`${EMERGENCY_API_URL}/${appointmentId}/accept`, {}, {
            headers: {
                'x-auth-token': getToken()
            }
        });
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};
