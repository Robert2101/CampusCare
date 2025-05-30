import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: '#1a1a1a', fontFamily: 'Regalia Monarch' }}>
            <Link to="/" className="text-xl font-bold">CampusCare</Link>
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