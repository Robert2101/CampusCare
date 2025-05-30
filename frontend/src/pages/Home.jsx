import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
    const [isVisible, setIsVisible] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // Starfield animation
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars = [];
        const starCount = window.innerWidth < 768 ? 100 : 200;

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                vx: Math.floor(Math.random() * 50) - 25,
                vy: Math.floor(Math.random() * 50) - 25
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();

                star.x += star.vx / 100;
                star.y += star.vy / 100;

                if (star.x < 0 || star.x > canvas.width) star.x = Math.random() * canvas.width;
                if (star.y < 0 || star.y > canvas.height) star.y = Math.random() * canvas.height;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (user) {
            if (user.role === 'Student') {
                navigate('/dashboard/student');
            } else if (user.role === 'Mentor') {
                navigate('/dashboard/mentor');
            }
        }
        setTimeout(() => setIsVisible(true), 100);
    }, [user, navigate]);

    const renderAuthButtons = (size = 'lg') => {
        const sizeClasses = {
            lg: 'px-12 py-6 text-2xl',
            md: 'px-10 py-5 text-xl',
            sm: 'px-8 py-4 text-lg'
        };

        if (user) {
            return (
                <Link
                    to={user.role === 'Student' ? '/dashboard/student' : '/dashboard/mentor'}
                    className={`${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg`}
                >
                    Enter Dashboard
                </Link>
            );
        } else {
            return (
                <div className={`flex flex-col sm:flex-row justify-center gap-6 ${size === 'lg' ? 'mt-12' : 'mt-8'}`}>
                    <Link
                        to="/login"
                        className={`${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg`}
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className={`${sizeClasses[size]} bg-transparent hover:bg-white/10 text-white border-2 border-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg`}
                    >
                        Register
                    </Link>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen text-white overflow-hidden relative font-sans">
            {/* Starfield Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
            />

            {/* Content Container */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 w-full py-6 px-8 flex justify-between items-center z-50 bg-black/30 backdrop-blur-md">
                    <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
                        CampusCare
                    </div>
                    <div className="hidden md:flex gap-8">
                        <a href="#features" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Features</a>
                        <Link to="/assessment" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Take Assessment</Link>
                        <a href="#resources" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Resources</a>
                        <a href="#about" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">About</a>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="h-screen w-full flex flex-col items-center justify-center text-center px-4 relative">
                    <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                            CampusCare
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
                            Your mental health companion in the vast universe of student life
                        </p>
                        <Link
                            to="/assessment"
                            className="px-12 py-6 text-2xl bg-gradient-to-r from-black via-gray-900 to-gray-800 hover:from-gray-950 hover:to-black text-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg"
                        >
                            Take Anxiety and Depression Test
                        </Link>
                    </div>

                    <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="min-h-screen w-full flex flex-col items-center justify-center py-32 px-4 max-w-6xl mx-auto backdrop-blur-sm bg-black/30 rounded-3xl my-12">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-200">
                            Your Support System
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 mb-20">
                            <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 border border-white/10">
                                <div className="text-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">24/7</div>
                                <h3 className="text-2xl font-bold mb-4">Always Available</h3>
                                <p className="text-white/80">Access support whenever you need it, day or night.</p>
                            </div>
                            <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 border border-white/10">
                                <div className="text-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">100%</div>
                                <h3 className="text-2xl font-bold mb-4">Confidential</h3>
                                <p className="text-white/80">Your privacy is our top priority. Share without fear.</p>
                            </div>
                            <div className="bg-white/5 p-8 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 border border-white/10">
                                <div className="text-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">✓</div>
                                <h3 className="text-2xl font-bold mb-4">Peer Support</h3>
                                <p className="text-white/80">Connect with others who understand your journey.</p>
                            </div>
                        </div>
                        {/* {renderAuthButtons('md')} */}
                    </div>
                </section>

                {/* Resources Section */}
                <section id="resources" className="min-h-screen w-full flex flex-col items-center justify-center py-32 px-4 max-w-4xl mx-auto backdrop-blur-sm bg-black/30 rounded-3xl my-12">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-200">
                            Immediate Help
                        </h2>
                        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                            If you're in crisis, please reach out to these trusted resources:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6 mb-16">
                            <a href="#" className="bg-white/5 hover:bg-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 border border-white/10">
                                <h3 className="text-xl font-bold mb-2">National Crisis Line</h3>
                                <p className="text-white/70">24/7 support for immediate help</p>
                            </a>
                            <a href="#" className="bg-white/5 hover:bg-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Campus Counseling</h3>
                                <p className="text-white/70">On-site professional support</p>
                            </a>
                            <a href="#" className="bg-white/5 hover:bg-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Self-Care Toolkit</h3>
                                <p className="text-white/70">Guided exercises and resources</p>
                            </a>
                            <a href="#" className="bg-white/5 hover:bg-white/10 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 border border-white/10">
                                <h3 className="text-xl font-bold mb-2">Peer Support Groups</h3>
                                <p className="text-white/70">Connect with others</p>
                            </a>
                        </div>
                        {renderAuthButtons('md')}
                    </div>
                </section>

                {/* Footer */}
                <footer className="w-full py-20 bg-black/70 text-center">
                    <div className="max-w-6xl mx-auto px-4">
                        <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
                            CampusCare
                        </h3>
                        <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                            You are not alone. Help is always available when you need it.
                        </p>
                        <div className="flex justify-center gap-8 mb-8">
                            <a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Privacy</a>
                            <a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Terms</a>
                            <a href="#" className="text-white/60 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Contact</a>
                        </div>
                        <p className="text-white/50 text-sm">© {new Date().getFullYear()} CampusCare. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default Home;