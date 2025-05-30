import React, { useState } from 'react'; // Modified: Added useState import
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import Home from './pages/Home';
import MentalHealthAssessment from './pages/MentalHealthAssessment';
import StudentNavbar from './components/StudentNavbar';
import MentorNavbar from './components/MentorNavbar';

function App() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview'); // NEW: State for active tab

    const renderNavbar = () => {
        if (!user) return <Navbar />;
        if (user.role === 'Student') return <StudentNavbar activeTab={activeTab} setActiveTab={setActiveTab} />;
        if (user.role === 'Mentor') return <MentorNavbar />;
        return <Navbar />;
    };

    return (
        <Router>
            <AuthProvider>
                {renderNavbar()}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/assessment" element={<MentalHealthAssessment />} />

                    {/* Root path "/" - redirect based on user or go to home if unauthenticated */}
                    <Route path="/" element={<PublicOrRedirect />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard/student"
                        element={
                            <ProtectedRoute allowedRoles={['Student']}>
                                <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} /> {/* Modified: Pass activeTab props */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/mentor"
                        element={
                            <ProtectedRoute allowedRoles={['Mentor']}>
                                <MentorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat/:receiverId"
                        element={
                            <ProtectedRoute allowedRoles={['Student', 'Mentor']}>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

// This component redirects based on user role if logged in,
// or sends unauthenticated users to "/home"
function PublicOrRedirect() {
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user?.role === 'Student') {
            navigate('/dashboard/student');
        } else if (user?.role === 'Mentor') {
            navigate('/dashboard/mentor');
        } else {
            navigate('/home');
        }
    }, [user, navigate]);

    return <div className="text-center mt-10">Redirecting...</div>;
}

export default App;