import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCalendar, FiClock, FiInfo, FiMessageSquare, FiUser, FiX } from 'react-icons/fi';

const StudentAppointmentsTab = ({ myAppointments, handleCancelAppointment }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleAccordion = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="mt-8">
            <h2 className="text-3xl font-bold text-indigo-200 mb-6 border-b-2 border-indigo-500/50 pb-2">
                Your Appointments
            </h2>
            
            {myAppointments.length === 0 ? (
                <p className="text-center text-gray-400">No appointments scheduled yet.</p>
            ) : (
                <div className="space-y-4">
                    {myAppointments.map((app) => (
                        <div
                            key={app._id}
                            className={`rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${app.status === 'Pending'
                                ? 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-900/10 to-gray-900/20'
                                : app.status === 'Accepted'
                                    ? 'border-l-4 border-green-500 bg-gradient-to-r from-green-900/10 to-gray-900/20'
                                    : app.status === 'Rejected' || app.status === 'Cancelled'
                                        ? 'border-l-4 border-red-500 bg-gradient-to-r from-red-900/10 to-gray-900/20'
                                        : 'border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-900/10 to-gray-900/20'
                            }`}
                        >
                            <button
                                onClick={() => toggleAccordion(app._id)}
                                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-full ${app.status === 'Pending'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : app.status === 'Accepted'
                                            ? 'bg-green-500/20 text-green-400'
                                            : app.status === 'Rejected' || app.status === 'Cancelled'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-indigo-500/20 text-indigo-400'
                                    }`}>
                                        <FiUser className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-indigo-100">
                                            {app.mentor ? app.mentor.name : 'Unassigned (Emergency)'}
                                        </h3>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${app.status === 'Pending'
                                                ? 'bg-yellow-900/40 text-yellow-300'
                                                : app.status === 'Accepted'
                                                    ? 'bg-green-900/40 text-green-300'
                                                    : app.status === 'Rejected' || app.status === 'Cancelled'
                                                        ? 'bg-red-900/40 text-red-300'
                                                        : 'bg-gray-800 text-gray-300'
                                            }`}>
                                                {app.status}
                                            </span>
                                            <span className="text-sm text-gray-400 flex items-center">
                                                <FiCalendar className="mr-1" /> {new Date(app.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm text-gray-400 flex items-center">
                                                <FiClock className="mr-1" /> {app.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {expandedId === app._id ? (
                                    <FiChevronUp className="w-5 h-5 text-indigo-300 transition-transform" />
                                ) : (
                                    <FiChevronDown className="w-5 h-5 text-indigo-300 transition-transform" />
                                )}
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedId === app._id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-5 pb-5 space-y-4 border-t border-gray-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start space-x-3 bg-gray-800/30 p-3 rounded-lg">
                                            <FiInfo className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400">Appointment Type</h4>
                                                <p className="text-indigo-100">{app.type}</p>
                                            </div>
                                        </div>
                                        
                                        {app.notes && (
                                            <div className="flex items-start space-x-3 bg-gray-800/30 p-3 rounded-lg">
                                                <FiMessageSquare className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-400">Your Notes</h4>
                                                    <p className="text-indigo-100">{app.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {app.mentorDescription && app.status === 'Completed' && (
                                            <div className="flex items-start space-x-3 bg-gray-800/30 p-3 rounded-lg col-span-1 md:col-span-2">
                                                <FiMessageSquare className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-400">Mentor's Notes</h4>
                                                    <p className="text-green-100">{app.mentorDescription}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {app.status === 'Pending' && (
                                        <button
                                            onClick={() => handleCancelAppointment(app._id)}
                                            className="flex items-center justify-center space-x-2 mt-4 bg-red-600/90 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                        >
                                            <FiX className="w-4 h-4" />
                                            <span>Cancel Appointment</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentAppointmentsTab;