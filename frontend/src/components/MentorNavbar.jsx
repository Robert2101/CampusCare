// client/src/components/MentorNavbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MentorNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-700 p-4 shadow-lg rounded-b-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold tracking-wide">
                    CampusCare
                </Link>
                <div className="flex items-center space-x-6">

                    <span className="text-white text-lg font-medium">
                        Welcome, {user.name} ({user.role})
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default MentorNavbar;