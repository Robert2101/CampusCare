import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getConversations } from '../api/chat';
import { getMentorAppointments, updateAppointmentStatus, getPendingEmergencyAppointmentsForMentors, acceptEmergencyAppointment } from '../api/appointment';
import { useNavigate } from 'react-router-dom';

const MentorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [pendingEmergencyAppointments, setPendingEmergencyAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [mentorDescription, setMentorDescription] = useState('');
    const [activeTab, setActiveTab] = useState('urgent'); // New state for active tab

    const fetchDashboardData = async () => {
        if (!user || user.role !== 'Mentor') {
            setLoading(false);
            return;
        }

        try {
            const conversationList = await getConversations();
            setConversations(conversationList);

            const regularAppointments = await getMentorAppointments();
            setMyAppointments(regularAppointments);

            const pendingEmergencies = await getPendingEmergencyAppointmentsForMentors();
            setPendingEmergencyAppointments(pendingEmergencies);

        } catch (err) {
            setError(err.msg || 'Failed to fetch dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const emergencyPollInterval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(emergencyPollInterval);
    }, [user]);

    const viewChat = (partnerId) => {
        navigate(`/chat/${partnerId}`);
    };

    const handleAppointmentStatusUpdate = async (appointmentId, status, description = '') => {
        try {
            await updateAppointmentStatus(appointmentId, status, description);
            setSelectedAppointmentId(null);
            setMentorDescription('');
            fetchDashboardData();
        } catch (err) {
            setError(err.msg || `Failed to ${status.toLowerCase()} appointment.`);
            console.error(err);
        }
    };

    const handleAcceptEmergencyAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to accept this emergency request? You will be assigned to this student.')) {
            try {
                const acceptedApp = await acceptEmergencyAppointment(appointmentId);
                window.alert(`Emergency request accepted! You are now assigned to ${acceptedApp.student.name}. Please connect with them via chat.`);
                fetchDashboardData();
                navigate(`/chat/${acceptedApp.student._id}`);
            } catch (err) {
                setError(err.msg || 'Failed to accept emergency request. It might have been accepted by another mentor.');
                console.error(err);
            }
        }
    };

    const handleMarkAsCompletedClick = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setMentorDescription('');
    };

    const handleDescriptionSubmit = (appointmentId) => {
        if (!mentorDescription.trim()) {
            window.alert('Please provide a description before marking as completed.');
            return;
        }
        handleAppointmentStatusUpdate(appointmentId, 'Completed', mentorDescription);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
                    <div className="text-xl text-purple-200">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-xl shadow-lg max-w-md" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <button 
                        onClick={() => setError('')}
                        className="mt-2 bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6"> {/* Changed bg-gray-900 to bg-black */}
            <div className="container mx-auto bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800"> {/* Adjusted background and border for contrast */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2"> {/* Changed gradient text to white */}
                        Mentor Dashboard
                    </h1>
                    <p className="text-gray-400">Welcome back, {user?.name}</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8 bg-gray-800 rounded-lg p-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab('urgent')}
                        className={`py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ${activeTab === 'urgent' ? 'bg-red-700 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        Urgent Requests 
                    </button>
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ${activeTab === 'appointments' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        My Appointments 
                    </button>
                    <button
                        onClick={() => setActiveTab('conversations')}
                        className={`py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ${activeTab === 'conversations' ? 'bg-purple-700 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    >
                        Conversations 
                    </button>
                </div>

                {/* Conditional Rendering based on activeTab */}
                {activeTab === 'urgent' && (
                    <section className="mb-12">
                        <div className="flex items-center mb-6">
                            <div className="h-10 w-1 bg-red-500 rounded-full mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-200">Urgent Requests</h2>
                        </div>
                        {pendingEmergencyAppointments.length === 0 ? (
                            <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-dashed border-gray-600">
                                <p className="text-gray-400">No urgent requests pending at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pendingEmergencyAppointments.map(app => (
                                    <div key={app._id} className="p-6 rounded-xl shadow-lg bg-gray-900 border border-red-500/30 hover:border-red-500/50 transition-all duration-300"> {/* Changed background to black shade */}
                                        <div className="flex items-start mb-4">
                                            <div className="bg-red-500/20 p-2 rounded-lg mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-red-400 mb-1">
                                                    Emergency Request from {app.student ? app.student.name : 'N/A'}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(app.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-800 rounded-lg p-4 mb-4"> {/* Changed background to black shade */}
                                            <p className="text-gray-300">
                                                {app.notes || 'No specific notes provided.'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAcceptEmergencyAppointment(app._id)}
                                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-5 rounded-lg shadow-lg transition-all duration-300 hover:shadow-red-500/20 flex items-center justify-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Accept Emergency
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'appointments' && (
                    <section className="mb-12">
                        <div className="flex items-center mb-6">
                            <div className="h-10 w-1 bg-blue-500 rounded-full mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-200">Your Regular Appointments</h2>
                        </div>
                        {myAppointments.length === 0 ? (
                            <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-dashed border-gray-600">
                                <p className="text-gray-400">No regular appointments requested yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {myAppointments.map(app => (
                                    <div key={app._id} className={`p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-lg ${app.status === 'Pending' ? 'bg-gray-900 border-yellow-500/30 hover:border-yellow-500/50' : // Changed background to black shade
                                            app.status === 'Accepted' ? 'bg-gray-900 border-green-500/30 hover:border-green-500/50' : // Changed background to black shade
                                            app.status === 'Rejected' || app.status === 'Cancelled' ? 'bg-gray-900 border-red-500/30 hover:border-red-500/50' : // Changed background to black shade
                                                'bg-gray-900 border-gray-600 hover:border-gray-500' // Changed background to black shade
                                        }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-200 mb-1">
                                                    {app.student ? app.student.name : 'N/A'}
                                                </h3>
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${app.status === 'Pending' ? 'bg-yellow-900/50 text-yellow-300' :
                                                    app.status === 'Accepted' ? 'bg-green-900/50 text-green-300' :
                                                    app.status === 'Rejected' || app.status === 'Cancelled' ? 'bg-red-900/50 text-red-300' :
                                                        'bg-gray-700 text-gray-300'
                                                    }`}>
                                                    {app.status}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 text-sm">{new Date(app.date).toLocaleDateString()}</p>
                                                <p className="text-gray-300 font-medium">{app.time}</p>
                                            </div>
                                        </div>

                                        {app.notes && (
                                            <div className="bg-gray-800 rounded-lg p-3 mb-4"> {/* Changed background to black shade */}
                                                <p className="text-gray-300 text-sm">{app.notes}</p>
                                            </div>
                                        )}

                                        {app.mentorDescription && app.status === 'Completed' && (
                                            <div className="bg-gray-800 rounded-lg p-3 mb-4"> {/* Changed background to black shade */}
                                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Your Notes</p>
                                                <p className="text-gray-300 text-sm">{app.mentorDescription}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {app.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAppointmentStatusUpdate(app._id, 'Accepted')}
                                                        className="flex-1 bg-green-700 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleAppointmentStatusUpdate(app._id, 'Rejected')}
                                                        className="flex-1 bg-red-700 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {app.status === 'Accepted' && (
                                                <>
                                                    <button
                                                        onClick={() => handleMarkAsCompletedClick(app._id)}
                                                        className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Complete
                                                    </button>
                                                    {selectedAppointmentId === app._id && (
                                                        <div className="mt-4 w-full">
                                                            <textarea
                                                                value={mentorDescription}
                                                                onChange={(e) => setMentorDescription(e.target.value)}
                                                                placeholder="Enter notes for the student..."
                                                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 placeholder-gray-500" // Changed background and border
                                                                rows="3"
                                                            />
                                                            <div className="mt-3 flex gap-2">
                                                                <button
                                                                    onClick={() => handleDescriptionSubmit(app._id)}
                                                                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                                                                >
                                                                    Submit Notes
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedAppointmentId(null)}
                                                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'conversations' && (
                    <section className="mt-12">
                        <div className="flex items-center mb-6">
                            <div className="h-10 w-1 bg-purple-500 rounded-full mr-3"></div>
                            <h2 className="text-2xl font-bold text-gray-200">Your Conversations</h2>
                        </div>
                        {conversations.length === 0 ? (
                            <div className="bg-gray-700/50 rounded-xl p-8 text-center border border-dashed border-gray-600">
                                <p className="text-gray-400">No active conversations yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {conversations.map(partner => (
                                    <div key={partner._id} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group"> {/* Changed background and border */}
                                        <div className="flex items-center mb-4">
                                            <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-all duration-300"> {/* Changed gradient text to white */}
                                                Anonymous Partner
                                            </h2>
                                        </div>
                                        <div className="bg-gray-800 rounded-lg p-3 mb-4"> {/* Changed background to black shade */}
                                            <p className="text-gray-400 text-sm">Chat ID: <span className="font-mono text-purple-300">{partner._id.slice(-6)}</span></p>
                                        </div>
                                        <button
                                            onClick={() => viewChat(partner._id)}
                                            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-medium py-2 px-5 rounded-lg shadow-md transition-all duration-300 hover:shadow-purple-500/20 flex items-center justify-center" // Changed gradient to solid color
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Open Chat
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default MentorDashboard;