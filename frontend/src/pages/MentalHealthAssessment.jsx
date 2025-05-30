import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function MentalHealthAssessment() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [showTest, setShowTest] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [results, setResults] = useState(null);

    // Wellness Check questions
    const questions = [
        {
            text: 'How often have you felt down or low in spirits these past two weeks?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you struggled to fall or stay asleep lately?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you felt anxious or on edge recently?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you found it hard to stop worrying?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you lost interest in activities you usually enjoy?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you felt drained or low on energy?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you struggled to focus on tasks like studying or hobbies?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you felt overwhelmed by your daily responsibilities?',
            options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
            scores: [0, 1, 2, 3]
        },
        {
            text: 'How often have you felt supported by friends or family?',
            options: ['Almost Always', 'Often', 'Sometimes', 'Rarely'],
            scores: [0, 1, 2, 3] // Reversed scoring
        },
        {
            text: 'How often have you felt optimistic about what lies ahead?',
            options: ['Almost Always', 'Often', 'Sometimes', 'Rarely'],
            scores: [0, 1, 2, 3] // Reversed scoring
        }
    ];

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

    // Redirect logged-in users to their dashboard
    useEffect(() => {
        if (user) {
            if (user.role === 'Student') {
                navigate('/dashboard/student');
            } else if (user.role === 'Mentor') {
                navigate('/dashboard/mentor');
            }
        }
    }, [user, navigate]);

    // Handle answer selection
    const handleAnswer = (score) => {
        setAnswers([...answers, score]);
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            calculateResults();
        }
    };

    // Calculate test results
    const calculateResults = () => {
        const totalScore = answers.reduce((sum, score) => sum + score, 0);
        let feedback = {};

        if (totalScore <= 10) {
            feedback = {
                level: 'High',
                message: "You're doing alright, but there might be moments when things feel a bit off. That's okay, and checking in with yourself is a great step.",
                insights: [
                    "You may have occasional stress or low moments, which is normal.",
                    "Small tweaks to your routine could boost your well-being."
                ],
                copingTechniques: [
                    "Try deep breathing: Inhale for 4, hold for 4, exhale for 4.",
                    "Write down your thoughts in a journal to gain clarity.",
                    "Reach out to a friend for a quick, uplifting chat."
                ]
            };
        } else if (totalScore <= 20) {
            feedback = {
                level: 'Medium',
                message: "It seems like you're facing some challenges that might be weighing you down. It's okay to feel this way, and there are ways to lighten the load.",
                insights: [
                    "You might be dealing with frequent stress or anxiety.",
                    "Overwhelm could be a sign to prioritize self-care."
                ],
                copingTechniques: [
                    "Spend 5 minutes on mindfulness, noticing your surroundings.",
                    "Break tasks into smaller, manageable steps.",
                    "Talk to someone you trust or explore our support options."
                ]
            };
        } else {
            feedback = {
                level: 'Low',
                message: "It looks like you're going through a tough time, and it takes strength to reflect on that. You're not alone, and there are steps you can take to feel better.",
                insights: [
                    "Frequent stress or low mood might be impacting your daily life.",
                    "A lack of support or optimism could be adding to the challenge."
                ],
                copingTechniques: [
                    "Use grounding: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
                    "Connect with our emergency support or a trusted person.",
                    "Start a small routine, like a 10-minute walk, for structure."
                ],
                recommendation: "If these feelings continue, try connecting with a mentor or professional on our platform or through the resources below."
            };
        }

        setResults(feedback);
        setShowTest(false);
    };

    // Reset test
    const resetTest = () => {
        setShowTest(true);
        setCurrentQuestion(0);
        setAnswers([]);
        setResults(null);
    };

    // Render auth buttons
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
                    className={`${sizeClasses[size]} bg-transparent hover:bg-white/10 text-white border-2 border-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg`}
                >
                    Enter Dashboard
                </Link>
            );
        } else {
            return (
                <div className={`flex flex-col sm:flex-row justify-center gap-6 ${size === 'lg' ? 'mt-12' : 'mt-8'}`}>
                    <Link
                        to="/login"
                        className={`${sizeClasses[size]} bg-transparent hover:bg-white/10 text-white border-2 border-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg`}
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

    // Battery visualization component
    const BatteryLevel = ({ level }) => {
        const batteryStyles = {
            Low: { fill: '#ef4444', height: '20%' }, // Red for Low
            Medium: { fill: '#f59e0b', height: '50%' }, // Amber for Medium
            High: { fill: '#10b981', height: '90%' } // Green for High
        };

        const { fill, height } = batteryStyles[level] || batteryStyles.High;

        return (
            <div className="flex flex-col items-center">
                <div className="w-20 h-36 bg-black/50 rounded-2xl relative overflow-hidden shadow-lg border-2 border-white/20">
                    <div
                        className="absolute bottom-0 w-full transition-all duration-500"
                        style={{ backgroundColor: fill, height, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}
                    />
                </div>
                <p className="mt-4 text-lg font-semibold text-white/80">{level} Energy</p>
            </div>
        );
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
                        <Link to="/home" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Home</Link>
                        <a href="#wellness" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Wellness Check</a>
                        <Link to="/home#resources" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">Resources</Link>
                        <Link to="/home#about" className="text-white/80 hover:text-white transition-colors duration-300 hover:underline underline-offset-8">About</Link>
                    </div>
                </nav>

                {/* Wellness Check Section */}
                <section id="wellness" className="min-h-screen w-full flex flex-col items-center justify-center py-32 px-4 max-w-5xl mx-auto backdrop-blur-sm bg-black/30 rounded-3xl my-12">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-200">
                            Wellness Check
                        </h2>
                        {showTest && !results ? (
                            <div className="bg-black/50 p-8 rounded-2xl shadow-xl max-w-2xl mx-auto transform transition-all duration-500 hover:scale-105 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                                <h3 className="text-2xl font-semibold mb-6 text-white">
                                    Step {currentQuestion + 1} of {questions.length}
                                </h3>
                                <p className="text-xl text-white/80 mb-8">{questions[currentQuestion].text}</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {questions[currentQuestion].options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswer(questions[currentQuestion].scores[index])}
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 shadow-md"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowTest(false)}
                                    className="mt-6 text-white/80 hover:text-white underline"
                                >
                                    Stop Check
                                </button>
                            </div>
                        ) : results ? (
                            <div className="bg-black/50 p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
                                <h3 className="text-3xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-200">
                                    Your Wellness Results
                                </h3>
                                <div className="flex flex-col md:flex-row gap-12">
                                    {/* Insights and Coping Techniques */}
                                    <div className="md:w-2/3">
                                        <p className="text-lg text-white/80 mb-8 leading-relaxed">{results.message}</p>
                                        <h4 className="text-xl font-semibold mb-4 text-white">Insights</h4>
                                        <ul className="list-disc list-inside text-gray-300 mb-8 font-['Poppins'] text-base leading-relaxed">
                                            {results.insights.map((insight, index) => (
                                                <li key={index} className="mb-3">{insight}</li>
                                            ))}
                                        </ul>
                                        <h4 className="text-xl font-semibold mb-4 text-white">Ways to Recharge</h4>
                                        <ul className="list-disc list-inside text-gray-300 mb-8 font-['Poppins'] text-base leading-relaxed">
                                            {results.copingTechniques.map((technique, index) => (
                                                <li key={index} className="mb-3">{technique}</li>
                                            ))}
                                        </ul>
                                        {results.recommendation && (
                                            <p className="text-lg text-white/80 mb-8 leading-relaxed">{results.recommendation}</p>
                                        )}
                                    </div>
                                    {/* Battery Visualization */}
                                    <div className="md:w-1/3 flex justify-center items-center">
                                        <BatteryLevel level={results.level} />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                                    <button
                                        onClick={resetTest}
                                        className="px-8 py-4 text-lg bg-transparent hover:bg-white/10 text-white border-2 border-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl text-center shadow-lg"
                                    >
                                        Retake Wellness Check
                                    </button>
                                    {!user && renderAuthButtons('sm')}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                                    Take a moment to check in with yourself. Our quick, anonymous Wellness Check helps you understand your current state and offers personalized tips to recharge.
                                </p>
                                <button
                                    onClick={() => setShowTest(true)}
                                    className="px-10 py-5 text-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl shadow-lg"
                                >
                                    Start Wellness Check
                                </button>
                            </div>
                        )}
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

            {/* CSS Animation Keyframes */}
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
}

export default MentalHealthAssessment;