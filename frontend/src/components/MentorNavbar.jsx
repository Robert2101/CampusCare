import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';
import logo from '../assets/logo.jpeg'; // Import the logo image

const MentorNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 p-4 shadow-xl rounded-b-lg border-b border-gray-700 backdrop-blur-sm">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                <Link 
                    to="/" 
                    className="text-white text-2xl font-bold tracking-wide hover:text-indigo-200 transition-colors duration-300 flex items-center"
                >
                                            <img src={logo} alt="CampusCare Logo" className="h-8 w-8 object-contain rounded-full" /> {/* Logo image */}
                    
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-indigo-200 ml-3">
                        CampusCare
                    </span>
                </Link>
                
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                    <div className="flex items-center space-x-2 bg-gray-800/80 px-4 py-2 rounded-full border border-gray-700 shadow-sm">
                        <FiUser className="text-indigo-300" />
                        <span className="text-gray-100 text-sm md:text-base font-medium">
                            {user.name} <span className="text-indigo-400">({user.role})</span>
                        </span>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="group flex items-center space-x-2 bg-red-600/90 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-all duration-300 hover:shadow-red-500/30 transform hover:-translate-y-0.5"
                    >
                        <FiLogOut className="transition-transform duration-300 group-hover:rotate-180" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default MentorNavbar;