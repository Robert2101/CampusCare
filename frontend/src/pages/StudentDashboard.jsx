// client/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMentors } from '../api/chat';
import { getStudentAppointments, updateAppointmentStatus } from '../api/appointment';
import { useNavigate } from 'react-router-dom';
import AppointmentModal from '../components/AppointmentModal';

// Import modular components
import StudentOverviewTab from '../components/StudentOverviewTab';
import StudentAppointmentsTab from '../components/StudentAppointmentsTab';
import StudentMentorsTab from '../components/StudentMentorsTab';
import MoodTrackerTab from '../components/MoodTrackerTab';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // State for active tab

    const fetchDashboardData = async () => {
        if (!user || user.role !== 'Student') {
            setLoading(false);
            return;
        }

        try {
            const mentorList = await getMentors();
            setMentors(mentorList);

            const appointments = await getStudentAppointments();
            setMyAppointments(appointments);

        } catch (err) {
            setError(err.msg || 'Failed to fetch dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // NEW: Poll for student appointments every 5 seconds to catch status updates
        const appointmentPollInterval = setInterval(() => {
            if (user && user.role === 'Student') {
                fetchDashboardData();
            }
        }, 5000); // Poll every 5 seconds

        // Cleanup interval on component unmount or user change
        return () => clearInterval(appointmentPollInterval);
    }, [user]); // Re-run effect if user changes

    const startChat = (mentorId) => {
        navigate(`/chat/${mentorId}`);
    };

    const handleBookAppointmentClick = (mentor) => {
        setSelectedMentor(mentor);
        setIsModalOpen(true);
    };

    const handleAppointmentBooked = () => {
        fetchDashboardData(); // Refresh appointments after booking
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await updateAppointmentStatus(appointmentId, 'Cancelled');
                fetchDashboardData(); // Refresh appointments after cancellation
            } catch (err) {
                setError(err.msg || 'Failed to cancel appointment.');
                console.error(err);
            }
        }
    };

    // This function will be passed to StudentOverviewTab
    const handleEmergencyRequestSent = () => {
        fetchDashboardData(); // Re-fetch all dashboard data to update appointment list
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

    // Helper for tab styling
    const getTabClasses = (tabName) =>
        `py-3 px-6 text-lg font-semibold cursor-pointer transition-colors duration-300 ${
            activeTab === tabName
                ? 'border-b-4 border-blue-600 text-blue-800'
                : 'text-gray-600 hover:text-blue-600'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Student Dashboard
                </h1>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={getTabClasses('overview')}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('moodTracker')}
                            className={getTabClasses('moodTracker')}
                        >
                            Mood Tracker
                        </button>
                        <button
                            onClick={() => setActiveTab('appointments')}
                            className={getTabClasses('appointments')}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => setActiveTab('mentors')}
                            className={getTabClasses('mentors')}
                        >
                            Connect with Mentors
                        </button>
                    </nav>
                </div>

                {/* Content based on activeTab */}
                {activeTab === 'overview' && (
                    <StudentOverviewTab
                        user={user}
                        myAppointments={myAppointments}
                        setActiveTab={setActiveTab}
                        onEmergencyRequestSent={handleEmergencyRequestSent}
                    />
                )}

                {activeTab === 'moodTracker' && (
                    <MoodTrackerTab />
                )}

                {activeTab === 'appointments' && (
                    <StudentAppointmentsTab
                        myAppointments={myAppointments}
                        handleCancelAppointment={handleCancelAppointment}
                    />
                )}

                {activeTab === 'mentors' && (
                    <StudentMentorsTab
                        mentors={mentors}
                        startChat={startChat}
                        handleBookAppointmentClick={handleBookAppointmentClick}
                    />
                )}
            </div>

            {selectedMentor && (
                <AppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mentorId={selectedMentor._id}
                    mentorName={selectedMentor.name}
                    onAppointmentBooked={handleAppointmentBooked}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
