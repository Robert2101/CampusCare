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
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null); // NEW: Track appointment for description input
    const [mentorDescription, setMentorDescription] = useState(''); // NEW: Store mentor's description input

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
            setSelectedAppointmentId(null); // NEW: Reset form
            setMentorDescription(''); // NEW: Clear description
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

    // NEW: Handler for initiating description input
    const handleMarkAsCompletedClick = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setMentorDescription(''); // Reset description input
    };

    // NEW: Handler for submitting description
    const handleDescriptionSubmit = (appointmentId) => {
        if (!mentorDescription.trim()) {
            window.alert('Please provide a description before marking as completed.');
            return;
        }
        handleAppointmentStatusUpdate(appointmentId, 'Completed', mentorDescription);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-700">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Mentor Dashboard
                </h1>

                {/* Pending Emergency Requests Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Urgent Requests</h2>
                    {pendingEmergencyAppointments.length === 0 ? (
                        <p className="text-center text-gray-600">No urgent requests pending at the moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingEmergencyAppointments.map(app => (
                                <div key={app._id} className="p-6 rounded-lg shadow-md border border-red-400 bg-red-50">
                                    <h3 className="text-xl font-semibold text-red-800 mb-2">
                                        Emergency Request from {app.student ? app.student.name : 'N/A'}
                                    </h3>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Requested:</span> {new Date(app.createdAt).toLocaleString()}
                                    </p>
                                    <p className="text-gray-700 mb-3">
                                        <span className="font-medium">Notes:</span> {app.notes || 'No specific notes provided.'}
                                    </p>
                                    <button
                                        onClick={() => handleAcceptEmergencyAppointment(app._id)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                                    >
                                        Accept Emergency
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Your Regular Appointments</h2>
                    {myAppointments.length === 0 ? (
                        <p className="text-center text-gray-600">No regular appointments requested yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myAppointments.map(app => (
                                <div key={app._id} className={`p-6 rounded-lg shadow-md border ${app.status === 'Pending' ? 'bg-yellow-50 border-yellow-200' :
                                        app.status === 'Accepted' ? 'bg-green-50 border-green-200' :
                                            app.status === 'Rejected' || app.status === 'Cancelled' ? 'bg-red-50 border-red-200' :
                                                'bg-gray-50 border-gray-200'
                                    }`}>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Appointment with {app.student ? app.student.name : 'N/A'}
                                    </h3>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Date:</span> {new Date(app.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Time:</span> {app.time}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Status:</span>{' '}
                                        <span className={`font-bold ${app.status === 'Pending' ? 'text-yellow-600' :
                                                app.status === 'Accepted' ? 'text-green-600' :
                                                    app.status === 'Rejected' || app.status === 'Cancelled' ? 'text-red-600' :
                                                        'text-gray-600'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </p>
                                    {app.notes && <p className="text-gray-700 mb-3"><span className="font-medium">Notes:</span> {app.notes}</p>}
                                    {app.mentorDescription && app.status === 'Completed' && (
                                        <p className="text-gray-700 mb-3"><span className="font-medium">Mentor Notes:</span> {app.mentorDescription}</p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {app.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleAppointmentStatusUpdate(app._id, 'Accepted')}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleAppointmentStatusUpdate(app._id, 'Rejected')}
                                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {app.status === 'Accepted' && (
                                            <>
                                                <button
                                                    onClick={() => handleMarkAsCompletedClick(app._id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                                >
                                                    Mark as Completed
                                                </button>
                                                {selectedAppointmentId === app._id && (
                                                    <div className="mt-4 w-full">
                                                        <textarea
                                                            value={mentorDescription}
                                                            onChange={(e) => setMentorDescription(e.target.value)}
                                                            placeholder="Enter notes for the student"
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            rows="4"
                                                        />
                                                        <div className="mt-2 flex gap-2">
                                                            <button
                                                                onClick={() => handleDescriptionSubmit(app._id)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
                                                            >
                                                                Submit
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedAppointmentId(null)}
                                                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
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

                <section className="mt-12">
                    <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Your Conversations</h2>
                    {conversations.length === 0 ? (
                        <p className="text-center text-gray-600 col-span-full">No active conversations yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {conversations.map(partner => (
                                <div key={partner._id} className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-green-200">
                                    <h2 className="text-2xl font-bold text-green-800 mb-2">
                                        Anonymous Partner
                                    </h2>
                                    <p className="text-gray-700 mb-4">Chat ID: {partner._id.slice(-6)}</p>
                                    <button
                                        onClick={() => viewChat(partner._id)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                                    >
                                        View Chat
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MentorDashboard;