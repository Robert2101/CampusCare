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
import StudentPodcastsTab from '../components/StudentPodcastsTab';

const StudentDashboard = ({ activeTab, setActiveTab }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);

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

        // Poll for student appointments every 5 seconds to catch status updates
        const appointmentPollInterval = setInterval(() => {
            if (user && user.role === 'Student') {
                fetchDashboardData();
            }
        }, 5000); // Poll every 5 seconds

        // Cleanup interval on component unmount or user change
        return () => clearInterval(appointmentPollInterval);
    }, [user]);

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

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-6"> {/* Modified: Added pt-20 for fixed navbar */}
            <div className="container mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Student Dashboard
                </h1>

                {/* Content based on activeTab */}
                {activeTab === 'overview' && (
                    <StudentOverviewTab
                        user={user}
                        myAppointments={myAppointments}
                        setActiveTab={setActiveTab}
                        onEmergencyRequestSent={handleEmergencyRequestSent}
                    />
                )}

                {activeTab === 'moodTracker' && <MoodTrackerTab />}

                {activeTab === 'podcasts' && <StudentPodcastsTab />}

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