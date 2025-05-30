import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentNavbar = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const getTabClasses = (tabName) =>
        `py-2 px-4 text-base font-semibold cursor-pointer transition-all duration-300 rounded-md ${
            activeTab === tabName
                ? 'bg-green-800 text-white shadow-md'
                : 'text-white/80 hover:bg-green-700 hover:text-white'
        }`;

    return (
        <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-green-600 to-green-700 p-4 shadow-lg z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/dashboard/student" className="text-white text-2xl font-bold tracking-wide">
                    CampusCare
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    {/* Tab Navigation */}
                    <div className="flex space-x-4">
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
                            Mentors
                        </button>
                        <button
                            onClick={() => setActiveTab('podcasts')}
                            className={getTabClasses('podcasts')}
                        >
                            Healing Conversations
                        </button>
                    </div>

                    
                    <button
                        onClick={handleLogout}
                        className="bg-transparent border-2 border-white text-white font-semibold py-1 px-4 rounded-lg hover:bg-white hover:text-green-600 transition duration-300 transform hover:scale-105"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white focus:outline-none"
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
                <div className="md:hidden bg-green-700/90 backdrop-blur-sm p-4 mt-2 rounded-b-lg">
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
                            className={getTabClasses('moodTracker')}
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
                            Podcasts
                        </button>
                        
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMobileMenuOpen(false);
                            }}
                            className="bg-transparent border-2 border-white text-white font-semibold py-2 px-4 rounded-lg hover:bg-white hover:text-green-600 transition duration-300"
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