import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
    return (
        <nav
            className="p-4 text-white flex justify-between items-center"
            style={{ backgroundColor: '#1a1a1a'}}
        >
            {/* Left side: Logo + Name */}
            <div className="flex items-center gap-2">
                <img src={logo} alt="CampusCare Logo" className="h-8 w-8 object-contain rounded-full" />
                <Link to="/" className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">CampusCare</Link>
            </div>

            {/* Right side: Buttons */}
            <div className="flex gap-4">
                <Link to="/login" className="hover:underline">Login</Link>
                <Link
                    to="/register"
                    className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
                >
                    Register
                </Link>
            </div>
        </nav>

    );
};

export default Navbar;