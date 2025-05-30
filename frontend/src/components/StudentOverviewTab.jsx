import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { createEmergencyAppointment } from '../api/appointment';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const StudentOverviewTab = ({ user, myAppointments, setActiveTab, onEmergencyRequestSent }) => {
    const [dailyTip, setDailyTip] = useState({ q: '', a: '' });
    const [tipLoading, setTipLoading] = useState(true);
    const [tipError, setTipError] = useState('');
    const [emergencyLoading, setEmergencyLoading] = useState(false);
    const [emergencyMessage, setEmergencyMessage] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

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

    const particlesInit = async (engine) => {
        await loadFull(engine);
    };

    return (
        <div className="relative overflow-hidden min-h-screen" ref={containerRef}>
            {/* Starfield Background */}
            <div className="absolute inset-0 z-0">
                <Particles
                    id="tsparticles"
                    init={particlesInit}
                    options={{
                        fpsLimit: 60,
                        interactivity: {
                            events: {
                                onHover: {
                                    enable: true,
                                    mode: "repulse"
                                }
                            }
                        },
                        particles: {
                            color: {
                                value: "#7c3aed"
                            },
                            links: {
                                color: "#8b5cf6",
                                distance: 150,
                                enable: true,
                                opacity: 0.3,
                                width: 1
                            },
                            move: {
                                direction: "none",
                                enable: true,
                                outModes: "out",
                                random: true,
                                speed: 0.5,
                                straight: false
                            },
                            number: {
                                density: {
                                    enable: true
                                },
                                value: 80
                            },
                            opacity: {
                                value: 0.5
                            },
                            shape: {
                                type: "circle"
                            },
                            size: {
                                value: { min: 1, max: 3 }
                            }
                        }
                    }}
                />
            </div>

            {/* Hero Section */}
            <motion.section 
                className="relative z-10 pt-32 pb-20 px-6 sm:px-12 lg:px-24"
                style={{
                    y: yBg,
                    scale: scaleBg
                }}
            >
                {/* Glowing Headline */}
                <motion.h2 
                    className="text-5xl md:text-7xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600 animate-gradient"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Welcome, <span className="text-white">{user.name}</span>
                </motion.h2>

                {/* Hero Description */}
                <motion.p 
                    className="text-xl text-center text-gray-300 max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    Your personalized wellness dashboard to connect with mentors, track your mood, and manage your academic journey.
                </motion.p>

                {/* Floating UI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Emergency Card */}
                    <motion.div 
                        className="glass-panel p-6 rounded-xl border border-indigo-500/20 backdrop-blur-lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        whileHover={{ y: -10 }}
                    >
                        <h3 className="text-2xl font-bold text-red-300 mb-4">Emergency Support</h3>
                        <p className="text-gray-300 mb-6">
                            Immediate connection with available mentors for urgent situations.
                        </p>
                        <button
                            onClick={handleEmergencyButtonClick}
                            disabled={emergencyLoading}
                            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 
                                ${emergencyLoading ? 'bg-red-800/50' : 'bg-red-600/90 hover:bg-red-700/90'}
                                shadow-lg hover:shadow-red-500/30`}
                        >
                            {emergencyLoading ? 'Sending...' : 'Request Help'}
                        </button>
                        {emergencyMessage && (
                            <motion.p 
                                className={`mt-4 text-sm font-medium ${emergencyMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {emergencyMessage}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Daily Tip Card */}
                    <motion.div 
                        className="glass-panel p-6 rounded-xl border border-purple-500/20 backdrop-blur-lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        whileHover={{ y: -10 }}
                    >
                        <h3 className="text-2xl font-bold text-purple-300 mb-4">Daily Wellness Tip</h3>
                        {tipLoading ? (
                            <div className="h-32 flex items-center justify-center">
                                <div className="animate-pulse flex space-x-4">
                                    <div className="flex-1 space-y-4 py-1">
                                        <div className="h-4 bg-purple-800/50 rounded w-3/4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-purple-800/50 rounded"></div>
                                            <div className="h-4 bg-purple-800/50 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : tipError ? (
                            <p className="text-red-400">{tipError}</p>
                        ) : (
                            <div>
                                <p className="text-lg italic text-gray-300 mb-3">"{dailyTip.q}"</p>
                                <p className="text-sm font-medium text-purple-400">— {dailyTip.a || 'Wellness Team'}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Appointments Card */}
                    <motion.div 
                        className="glass-panel p-6 rounded-xl border border-blue-500/20 backdrop-blur-lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        whileHover={{ y: -10 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-300">Upcoming</h3>
                            <button 
                                onClick={() => setActiveTab('appointments')}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                View All →
                            </button>
                        </div>
                        
                        {upcomingAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAppointments.map((app) => (
                                    <div key={app._id} className="bg-blue-900/20 p-3 rounded-lg">
                                        <p className="text-gray-300 font-medium">
                                            {new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {app.time} with <span className="text-blue-300">{app.mentor?.name}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-blue-900/20 p-4 rounded-lg text-center">
                                <p className="text-gray-400">No upcoming appointments</p>
                                <button 
                                    onClick={() => setActiveTab('appointments')}
                                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Schedule one now
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Mood Tracker Section */}
                <motion.div 
                    className="glass-panel mt-12 p-8 rounded-xl border border-indigo-500/20 backdrop-blur-lg max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    
                </motion.div>
            </motion.section>

            {/* Global Styles */}
            <style jsx global>{`
                .glass-panel {
                    background: rgba(15, 23, 42, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                
                .glass-panel:hover {
                    border-color: rgba(139, 92, 246, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(99, 102, 241, 0.3);
                }
                
                .animate-gradient {
                    background-size: 300%;
                    -webkit-animation: animatedgradient 6s ease infinite alternate;
                    -moz-animation: animatedgradient 6s ease infinite alternate;
                    animation: animatedgradient 6s ease infinite alternate;
                }
                
                @keyframes animatedgradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentOverviewTab;