import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '',
        role: 'Student',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const { name, email, password, password2, role } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            setError('Passwords do not match');
            return;
        }
        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        } catch (err) {
            const errors = err.errors;
            if (errors && errors.length > 0) {
                setError(errors.map((e) => e.msg).join(', '));
            } else {
                setError(err.msg || 'Registration failed. Please try again.');
            }
        }
    };

    // Starfield Canvas Effect
    useEffect(() => {
        const canvas = document.getElementById('starfield');
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
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col lg:flex-row bg-black overflow-hidden">
            {/* Starfield Canvas */}
            <canvas
                id="starfield"
                className="absolute inset-0 z-0"
                style={{ background: 'black' }}
            ></canvas>

            {/* Image (Left Side) */}
            <div className="relative z-10 hidden lg:flex w-full lg:w-1/2 items-center justify-center p-4">
                <img
                    src="https://i.pinimg.com/736x/be/8e/41/be8e418654942968e0419c56f0c102a4.jpg"
                    alt="Dark aesthetic night scene"
                    className="object-cover w-full h-full max-h-screen rounded-l-2xl shadow-2xl border-l border-indigo-500/30"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30"></div> {/* Overlay for contrast */}
            </div>

            {/* Register Form (Right Side) */}
            <div className="relative z-10 flex items-center justify-center w-full lg:w-1/2 p-4 lg:p-8">
                <div className="bg-black/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-black">
                    <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-8 ">
                        Register for CampusCare
                    </h1>
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 animate-fade-in">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-indigo-200 text-sm font-semibold mb-2 transition-opacity duration-300 hover:opacity-80"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-indigo-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                placeholder="Your Full Name"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-indigo-200 text-sm font-semibold mb-2 transition-opacity duration-300 hover:opacity-80"
                            >
                                University Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-indigo-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                placeholder="your.email@srmap.edu.in"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-indigo-200 text-sm font-semibold mb-2 transition-opacity duration-300 hover:opacity-80"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-indigo-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password2"
                                className="block text-indigo-200 text-sm font-semibold mb-2 transition-opacity duration-300 hover:opacity-80"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="password2"
                                name="password2"
                                value={password2}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-indigo-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-indigo-200 text-sm font-semibold mb-2 transition-opacity duration-300 hover:opacity-80"
                            >
                                Register as
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={role}
                                onChange={onChange}
                                className="w-full px-4 py-3 bg-gray-900/50 text-white border border-indigo-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value="Student">Student</option>
                                <option value="Mentor">Mentor</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            Register
                        </button>
                    </form>
                    <p className="mt-8 text-center text-gray-300">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
