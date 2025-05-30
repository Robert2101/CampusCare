// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMentors, getConversations } from '../api/chat';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return; // Wait for user to be loaded

            try {
                if (user.role === 'Student') {
                    const mentorList = await getMentors();
                    setMentors(mentorList);
                } else if (user.role === 'Mentor') {
                    const conversationList = await getConversations();
                    setConversations(conversationList);
                }
            } catch (err) {
                setError(err.msg || 'Failed to fetch data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]); // Depend on user to refetch when user state changes

    const startChat = (mentorId) => {
        navigate(`/chat/${mentorId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-700">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    {user.role === 'Student' ? 'Connect with Mentors' : 'Your Conversations'}
                </h1>

                {user.role === 'Student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.length === 0 ? (
                            <p className="text-center text-gray-600 col-span-full">No mentors available at the moment.</p>
                        ) : (
                            mentors.map(mentor => (
                                <div key={mentor._id} className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200">
                                    <h2 className="text-2xl font-bold text-blue-800 mb-2">{mentor.name}</h2>
                                    <p className="text-gray-700 mb-4">{mentor.email}</p>
                                    <button
                                        onClick={() => startChat(mentor._id)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                    >
                                        Chat Anonymously
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {user.role === 'Mentor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {conversations.length === 0 ? (
                            <p className="text-center text-gray-600 col-span-full">No active conversations yet.</p>
                        ) : (
                            conversations.map(partner => (
                                <div key={partner._id} className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-green-200">
                                    <h2 className="text-2xl font-bold text-green-800 mb-2">{partner.name}</h2>
                                    <p className="text-gray-700 mb-4">{partner.email}</p>
                                    <button
                                        onClick={() => startChat(partner._id)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                                    >
                                        View Chat
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
