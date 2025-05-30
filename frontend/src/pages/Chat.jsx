// client/src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatHistory, sendMessage } from '../api/chat';

const Chat = () => {
    const { receiverId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        if (!user) return;
        try {
            const history = await getChatHistory(receiverId);
            setMessages(history);
        } catch (err) {
            setError(err.msg || 'Failed to fetch chat history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [receiverId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            const isAnonymous = user.role === 'Student' && true;
            await sendMessage(receiverId, newMessage, isAnonymous);
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            setError(err.msg || 'Failed to send message.');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <div className="text-xl text-green-400 animate-pulse">Loading chat...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg shadow-lg" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6 flex flex-col">
            <div className="container mx-auto bg-gray-900 rounded-xl shadow-2xl p-8 border border-green-800 flex flex-col flex-grow max-h-[calc(100vh-120px)]">
                <h1 className="text-3xl font-extrabold text-green-400 mb-6 text-center glow-green">
                    Chat with {user.role === 'Student' ? 'Mentor' : messages.length > 0 ? messages[0].sender.name === user.name ? "Student" : messages[0].sender.name : 'User'}
                </h1>

                <div className="flex-grow overflow-y-auto p-4 border border-green-800 rounded-lg bg-gray-800 mb-6 space-y-4 custom-scrollbar">
                    {messages.length === 0 ? (
                        <p className="text-center text-green-300">No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-md p-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl ${
                                        msg.sender._id === user.id
                                            ? 'bg-green-700 text-white rounded-br-none hover:bg-green-600'
                                            : 'bg-gray-700 text-gray-100 rounded-bl-none hover:bg-gray-600'
                                    }`}
                                >
                                    <div className="font-semibold text-sm mb-1">
                                        {msg.sender._id === user.id
                                            ? 'You'
                                            : msg.isAnonymous && user.role === 'Mentor'
                                                ? 'Anonymous Student'
                                                : msg.sender.name}
                                    </div>
                                    <p className="text-base">{msg.content}</p>
                                    <div className="text-xs mt-1 opacity-70">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow px-5 py-3 border border-green-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 text-white placeholder-green-400 transition duration-200 hover:border-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 glow-green-hover"
                    >
                        Send
                    </button>
                </form>
            </div>

            <style jsx>{`
                .glow-green {
                    text-shadow: 0 0 8px rgba(74, 222, 128, 0.7);
                }
                .glow-green-hover:hover {
                    box-shadow: 0 0 15px rgba(74, 222, 128, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1a1a1a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #047857;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #059669;
                }
            `}</style>
        </div>
    );
};

export default Chat;