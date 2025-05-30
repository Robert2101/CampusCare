import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMentors } from '../api/chat';
import { getStudentAppointments, updateAppointmentStatus } from '../api/appointment';
import { useNavigate } from 'react-router-dom';
import AppointmentModal from '../components/AppointmentModal';
import StudentOverviewTab from '../components/StudentOverviewTab';
import StudentAppointmentsTab from '../components/StudentAppointmentsTab';
import StudentMentorsTab from '../components/StudentMentorsTab';
import MoodTrackerTab from '../components/MoodTrackerTab';
import StudentPodcastsTab from '../components/StudentPodcastsTab';

const StudentDashboard = ({ activeTab, setActiveTab }) => {
    const canvasRef = useRef(null);
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

        const appointmentPollInterval = setInterval(() => {
            if (user && user.role === 'Student') {
                fetchDashboardData();
            }
        }, 5000);

        // Starfield Canvas Effect
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let stars = [];
        const numStars = 200;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createStar = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
        });

        const initStars = () => {
            stars = Array.from({ length: numStars }, createStar);
        };

        const drawStars = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            stars.forEach((star) => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });
        };

        const animate = () => {
            drawStars();
            requestAnimationFrame(animate);
        };

        resizeCanvas();
        initStars();
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            clearInterval(appointmentPollInterval);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [user]);

    const startChat = (mentorId) => {
        navigate(`/chat/${mentorId}`);
    };

    const handleBookAppointmentClick = (mentor) => {
        setSelectedMentor(mentor);
        setIsModalOpen(true);
    };

    const handleAppointmentBooked = () => {
        fetchDashboardData();
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await updateAppointmentStatus(appointmentId, 'Cancelled');
                fetchDashboardData();
            } catch (err) {
                setError(err.msg || 'Failed to cancel appointment.');
                console.error(err);
            }
        }
    };

    const handleEmergencyRequestSent = () => {
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <div className="text-xl text-indigo-300 animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg animate-fade-in" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black pt-20 px-4 sm:px-6">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ background: 'black' }}
            ></canvas>            <div className="container mx-auto relative z-10">
                <div className="bg-black/50 backdrop-blur-md rounded-xl shadow-2xl p-6 sm:p-8 border border-indigo-500/30">
                    

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