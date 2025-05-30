import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createEmergencyAppointment } from '../api/appointment';

const StudentOverviewTab = ({ user, myAppointments, setActiveTab, onEmergencyRequestSent }) => {
    const [dailyTip, setDailyTip] = useState({ q: '', a: '' });
    const [tipLoading, setTipLoading] = useState(true);
    const [tipError, setTipError] = useState('');
    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [emergencyMessage, setEmergencyMessage] = useState('');

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
            setTipError(err.response?.data?.msg || 'Failed to load daily tip.');
        } finally {
            setTipLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyTip();
        const tipRefreshInterval = setInterval(fetchDailyTip, 300000);
        return () => clearInterval(tipRefreshInterval);
    }, []);

    const handleEmergencyButtonClick = async () => {
        setEmergencyLoading(true);
        setEmergencyMessage('');
        try {
            await createEmergencyAppointment();
            setEmergencyMessage('Emergency request sent successfully! A mentor will respond shortly.');
            onEmergencyRequestSent();
            setTimeout(() => setEmergencyMessage(''), 5000);
        } catch (err) {
            setEmergencyMessage(err.response?.data?.msg || 'Failed to send emergency request.');
        } finally {
            setEmergencyLoading(false);
        }
    };

    const upcomingAppointments = myAppointments
        .filter((a) => a.type === 'Regular' && (a.status === 'Accepted' || a.status === 'Pending'))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);

    return (
        <section>
            <h2 className="text-3xl font-bold text-indigo-200 mb-6 border-b-2 border-indigo-500/50 pb-2">
                Welcome, {user.name}!
            </h2>
            <div className="bg-gray-900/50 p-6 rounded-lg shadow-md border border-indigo-500/30 text-center">
                <p className="text-xl text-gray-300 mb-4">
                    This is your central hub. Use the tabs above to manage your activities.
                </p>
                <p className="text-md text-gray-400">Connect with mentors and manage your appointments.</p>
            </div>

            <div className="mt-8 p-6 bg-red-900/20 rounded-lg shadow-md border border-red-500/50 text-center">
                <h3 className="text-2xl font-bold text-red-300 mb-4">Need Immediate Support?</h3>
                <p className="text-gray-300 mb-4">
                    Click below to send an urgent request to all available mentors.
                </p>
                <button
                    onClick={handleEmergencyButtonClick}
                    disabled={emergencyLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {emergencyLoading ? 'Sending Request...' : 'Emergency Support'}
                </button>
                {emergencyMessage && (
                    <p
                        className={`mt-4 text-lg font-semibold ${emergencyMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'
                            }`}
                    >
                        {emergencyMessage}
                    </p>
                )}
            </div>

            <div className="mt-8 p-6 bg-yellow-900/20 rounded-lg shadow-md border border-yellow-500/50">
                <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">Daily Mental Health Tip</h3>
                {tipLoading ? (
                    <p className="text-center text-gray-400">Loading your daily dose of inspiration...</p>
                ) : tipError ? (
                    <p className="text-center text-red-400">{tipError}</p>
                ) : (
                    <div className="text-center">
                        <p className="text-xl italic text-gray-300 mb-2">"{dailyTip.q}"</p>
                        <p className="text-lg font-semibold text-gray-400">- {dailyTip.a || 'Unknown'}</p>
                    </div>
                )}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-900/20 p-5 rounded-lg shadow-md border border-green-500/50">
                    <h3 className="text-xl font-bold text-green-300 mb-2">Upcoming Appointments</h3>
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((app) => (
                            <p key={app._id} className="text-gray-300 text-sm">
                                {new Date(app.date).toLocaleDateString()} at {app.time} with {app.mentor?.name}
                            </p>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">No upcoming regular appointments.</p>
                    )}
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className="mt-3 text-indigo-400 hover:text-indigo-300 hover:underline text-sm"
                    >
                        View all appointments
                    </button>
                </div>
            </div>
        </section>
    );
};

export default StudentOverviewTab;