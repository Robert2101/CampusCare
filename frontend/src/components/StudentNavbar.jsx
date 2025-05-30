import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentNavbar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const getTabClasses = (tabName) =>
        `py-2 px-4 text-base font-semibold cursor-pointer transition-all duration-300 rounded-md ${activeTab === tabName
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
            : 'text-gray-300 hover:bg-indigo-700/50 hover:text-white'
        }`;

    return (
        <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-black to-gray-900 p-4 shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link
                    to="/dashboard/student"
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 animate-pulse"
                >
                    CampusCare
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* Tab Navigation */}
                    <div className="flex space-x-4">
                        <button onClick={() => setActiveTab('overview')} className={getTabClasses('overview')}>
                            Overview
                        </button>
                        <button onClick={() => setActiveTab('moodTracker')} className={getTabClasses('moodTracker')}>
                            Mood Tracker
                        </button>
                        <button onClick={() => setActiveTab('appointments')} className={getTabClasses('appointments')}>
                            Appointments
                        </button>
                        <button onClick={() => setActiveTab('mentors')} className={getTabClasses('mentors')}>
                            Mentors
                        </button>
                        <button onClick={() => setActiveTab('podcasts')} className={getTabClasses('podcasts')}>
                            Healing Conversations
                        </button>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-transparent border-2 border-indigo-500 text-indigo-300 font-semibold py-1 px-4 rounded-lg hover:bg-indigo-600 hover:text-white transition duration-300 transform hover:scale-105"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-gray-300 focus:outline-none"
                        aria-label="Toggle mobile menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-md p-4 mt-2 rounded-b-lg">
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => {
                                setActiveTab('overview');
                                setIsMobileMenuOpen(false);
                            }}
                            className={getTabClasses('overview')}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('moodTracker');
                                setIsMobileMenuOpen(false);
                            }}
                            className={getTabClasses('moodTracker')}
                        >
                            Mood Tracker
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('appointments');
                                setIsMobileMenuOpen(false);
                            }}
                            className={getTabClasses('appointments')}
                        >
                            Appointments
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('mentors');
                                setIsMobileMenuOpen(false);
                            }}
                            className={getTabClasses('mentors')}
                        >
                            Mentors
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('podcasts');
                                setIsMobileMenuOpen(false);
                            }}
                            className={getTabClasses('podcasts')}
                        >
                            Healing Conversations
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-transparent border-2 border-indigo-500 text-indigo-300 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 hover:text-white transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default StudentNavbar;