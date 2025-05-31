import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createEmergencyAppointment, triggerHelplineCall } from '../api/appointment';

const StudentOverviewTab = ({ user, myAppointments, setActiveTab, onEmergencyRequestSent }) => {
    const [dailyTip, setDailyTip] = useState({ q: '', a: '' });
    const [tipLoading, setTipLoading] = useState(true);
    const [tipError, setTipError] = useState('');
    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [emergencyMessage, setEmergencyMessage] = useState('');
    const containerRef = useRef(null); // useRef is still useful for general DOM references, even without scroll effects

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
            const appointmentResponse = await createEmergencyAppointment();
            const callResponse = await triggerHelplineCall();

            setEmergencyMessage(
                `Emergency request sent! ${appointmentResponse.msg} ${callResponse.msg}`
            );
            onEmergencyRequestSent();
            setTimeout(() => setEmergencyMessage(''), 5000);
        } catch (err) {
            setEmergencyMessage(err.response?.data?.msg || 'Failed to send emergency request or make call.');
        } finally {
            setEmergencyLoading(false);
        }
    };

    const upcomingAppointments = myAppointments
        .filter((a) => a.type === 'Regular' && (a.status === 'Accepted' || a.status === 'Pending'))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);

    return (
        <div className="relative min-h-screen bg-gray-900 text-white" ref={containerRef}>
            {/* Background (no particles) - can be a simple color or pattern */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 to-indigo-950 opacity-80"></div>

            {/* Main Content Section */}
            <section className="relative z-10 pt-24 pb-12 px-4 sm:px-8 lg:px-16">
                {/* Headline */}
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-indigo-300">
                    Welcome, <span className="text-white">{user.name}</span>
                </h2>

                {/* Description */}
                <p className="text-lg text-center text-gray-400 max-w-2xl mx-auto mb-10">
                    Your wellness dashboard. Connect, track, and manage your journey.
                </p>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Emergency Card */}
                    <div
                        className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <h3 className="text-xl font-semibold text-red-400 mb-3">Emergency Support</h3>
                        <p className="text-gray-400 text-sm mb-5">
                            Immediate connection with available mentors for urgent situations.
                        </p>
                        <button
                            onClick={handleEmergencyButtonClick}
                            disabled={emergencyLoading}
                            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-300
                                ${emergencyLoading ? 'bg-red-900 text-gray-500' : 'bg-red-600 hover:bg-red-700 text-white'}
                                `}
                        >
                            {emergencyLoading ? 'Sending & Calling...' : 'Request Help & Call'}
                        </button>
                        {emergencyMessage && (
                            <p className={`mt-3 text-xs font-medium ${emergencyMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                                {emergencyMessage}
                            </p>
                        )}
                    </div>

                    {/* Daily Tip Card */}
                    <div
                        className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <h3 className="text-xl font-semibold text-purple-400 mb-3">Daily Wellness Tip</h3>
                        {tipLoading ? (
                            <div className="h-28 flex items-center justify-center">
                                <div className="animate-pulse flex space-x-3">
                                    <div className="flex-1 space-y-3 py-1">
                                        <div className="h-3 bg-purple-700/50 rounded w-3/4"></div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-purple-700/50 rounded"></div>
                                            <div className="h-3 bg-purple-700/50 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : tipError ? (
                            <p className="text-red-500 text-sm">{tipError}</p>
                        ) : (
                            <div>
                                <p className="text-md italic text-gray-300 mb-2">"{dailyTip.q}"</p>
                                <p className="text-xs font-medium text-purple-500">— {dailyTip.a || 'Wellness Team'}</p>
                            </div>
                        )}
                    </div>

                    {/* Appointments Card */}
                    <div
                        className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-md transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-semibold text-blue-400">Upcoming</h3>
                            <button
                                onClick={() => setActiveTab('appointments')}
                                className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                View All →
                            </button>
                        </div>

                        {upcomingAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingAppointments.map((app) => (
                                    <div key={app._id} className="bg-blue-900/30 p-2 rounded-md">
                                        <p className="text-gray-300 text-sm font-medium">
                                            {new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {app.time} with <span className="text-blue-400">{app.mentor?.name}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-blue-900/30 p-3 rounded-md text-center">
                                <p className="text-gray-400 text-sm">No upcoming appointments</p>
                                <button
                                    onClick={() => setActiveTab('appointments')}
                                    className="mt-2 text-blue-500 hover:text-blue-400 text-xs"
                                >
                                    Schedule one now
                                </button>
                            </div>
                        )}
                    </div>
                </div>


            </section>
        </div>
    );
};

export default StudentOverviewTab;