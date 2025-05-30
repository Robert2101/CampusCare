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
        // Set up a polling interval to fetch new messages every few seconds
        // In a real-world app, you'd use WebSockets for real-time updates
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval); // Clean up on unmount
    }, [receiverId, user]);

    useEffect(() => {
        // Scroll to the bottom of the chat when messages update
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        try {
            // Students send anonymously to mentors, otherwise not anonymous
            const isAnonymous = user.role === 'Student' && true; // Always true for student to mentor chat
            await sendMessage(receiverId, newMessage, isAnonymous);
            setNewMessage('');
            // After sending, refetch messages to update the chat history
            fetchMessages();
        } catch (err) {
            setError(err.msg || 'Failed to send message.');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl text-gray-700">Loading chat...</div>
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
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            <div className="container mx-auto bg-white rounded-xl shadow-2xl p-8 border border-gray-200 flex flex-col flex-grow max-h-[calc(100vh-120px)]">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
                    Chat with {user.role === 'Student' ? 'Mentor' : messages.length > 0 ? messages[0].sender.name === user.name ? "Student" : messages[0].sender.name : 'User'}
                </h1>

                <div className="flex-grow overflow-y-auto p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6 space-y-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-600">No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-md p-4 rounded-lg shadow-md ${
                                        msg.sender._id === user.id
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    <div className="font-semibold text-sm mb-1">
                                        {msg.sender._id === user.id
                                            ? 'You'
                                            : msg.isAnonymous && user.role === 'Mentor'
                                                ? 'Anonymous Student' // Mentor sees anonymous student
                                                : msg.sender.name}
                                    </div>
                                    <p className="text-base">{msg.content}</p>
                                    <div className="text-xs mt-1 opacity-80">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} /> {/* Scroll target */}
                </div>

                <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
