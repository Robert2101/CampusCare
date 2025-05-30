// client/src/components/StudentOverviewTab.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createEmergencyAppointment } from '../api/appointment'; // Import the new API call

const StudentOverviewTab = ({ user, myAppointments, setActiveTab, onEmergencyRequestSent }) => {
    // State for Daily Mental Health Tip
    const [dailyTip, setDailyTip] = useState({ q: '', a: '' });
    const [tipLoading, setTipLoading] = useState(true);
    const [tipError, setTipError] = useState('');
    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [emergencyMessage, setEmergencyMessage] = useState(''); // For success/error messages

    const fetchDailyTip = async () => {
        setTipLoading(true);
        setTipError('');
        try {
            const response = await axios.get('http://localhost:5001/api/utils/daily-tip');
            const data = response.data;

            if (data && data.q) {
                setDailyTip(data);
            } else {
                setTipError('No tip found.');
            }
        } catch (err) {
            console.error('Failed to fetch daily tip:', err);
            setTipError(err.response?.data?.msg || 'Failed to load daily tip. Please try again later.');
        } finally {
            setTipLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyTip(); // Fetch tip on initial load

        // Set up automatic refresh for the daily tip
        const tipRefreshInterval = setInterval(() => {
            fetchDailyTip();
        }, 300000); // 5 minutes

        // Clean up the interval on component unmount
        return () => clearInterval(tipRefreshInterval);
    }, []);

    const handleEmergencyButtonClick = async () => {
        setEmergencyLoading(true);
        setEmergencyMessage(''); // Clear previous messages

        try {
            const response = await createEmergencyAppointment();
            console.log('Emergency request API response:', response);

            setEmergencyMessage('Emergency request sent successfully! A mentor will respond shortly.');
            onEmergencyRequestSent(); // Notify parent to refresh appointments (this will trigger a re-fetch in StudentDashboard)

            // Optionally, clear the success message after a few seconds
            setTimeout(() => setEmergencyMessage(''), 5000);

        } catch (err) {
            console.error('Emergency request error:', err);
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                console.error('Error response headers:', err.response.headers);
            } else if (err.request) {
                console.error('Error request:', err.request);
            } else {
                console.error('Error message:', err.message);
            }

            setEmergencyMessage(err.response?.data?.msg || 'Failed to send emergency request. Please try again.');
        } finally {
            setEmergencyLoading(false);
        }
    };

    // MODIFIED: Filter upcoming appointments to exclude 'Emergency' type
    const upcomingAppointments = myAppointments.filter(a =>
        a.type === 'Regular' && (a.status === 'Accepted' || a.status === 'Pending')
    )
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2); // Show up to 2 upcoming regular appointments

    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Welcome, {user.name}!</h2>
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 text-center">
                <p className="text-xl text-gray-700 mb-4">
                    This is your central hub. Use the tabs above to manage your activities.
                </p>
                <p className="text-md text-gray-600">
                    Connect with mentors and manage your appointments.
                </p>
            </div>

            {/* Emergency Button */}
            <div className="mt-8 p-6 bg-red-100 rounded-lg shadow-md border border-red-300 text-center">
                <h3 className="text-2xl font-bold text-red-800 mb-4">Need Immediate Support?</h3>
                <p className="text-gray-700 mb-4">
                    Click the button below to send an urgent request to all available mentors.
                    The first mentor to accept will connect with you.
                </p>
                <button
                    onClick={handleEmergencyButtonClick}
                    disabled={emergencyLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {emergencyLoading ? 'Sending Request...' : 'Emergency Support'}
                </button>
                {emergencyMessage && (
                    <p className={`mt-4 text-lg font-semibold ${emergencyMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                        {emergencyMessage}
                    </p>
                )}
            </div>


            {/* Daily Mental Health Tip */}
            <div className="mt-8 p-6 bg-yellow-50 rounded-lg shadow-md border border-yellow-200">
                <h3 className="text-2xl font-bold text-yellow-800 mb-4 text-center">Daily Mental Health Tip</h3>
                {tipLoading ? (
                    <p className="text-center text-gray-600">Loading your daily dose of inspiration...</p>
                ) : tipError ? (
                    <p className="text-center text-red-600">{tipError}</p>
                ) : (
                    <div className="text-center">
                        <p className="text-xl italic text-gray-800 mb-2">"{dailyTip.q}"</p>
                        <p className="text-lg font-semibold text-gray-700">- {dailyTip.a || 'Unknown'}</p>
                    </div>
                )}
            </div>

            {/* Summary of key info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-5 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(app => (
                            <p key={app._id} className="text-gray-700 text-sm">{new Date(app.date).toLocaleDateString()} at {app.time} with {app.mentor?.name}</p>
                        ))
                    ) : (
                        <p className="text-gray-600 text-sm">No upcoming regular appointments.</p>
                    )}
                    <button onClick={() => setActiveTab('appointments')} className="mt-3 text-blue-600 hover:underline text-sm">View all appointments</button>
                </div>
            </div>
        </section>
    );
};

export default StudentOverviewTab;
