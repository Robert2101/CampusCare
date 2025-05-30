// client/src/components/StudentAppointmentsTab.jsx
import React from 'react';

const StudentAppointmentsTab = ({ myAppointments, handleCancelAppointment }) => {
    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Your Appointments</h2>
            {myAppointments.length === 0 ? (
                <p className="text-center text-gray-600">You have no appointments booked yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myAppointments.map(app => (
                        <div key={app._id} className={`p-6 rounded-lg shadow-md border ${
                            app.type === 'Emergency' ? 'bg-red-50 border-red-200' : // Highlight emergency
                            app.status === 'Pending' ? 'bg-yellow-50 border-yellow-200' :
                            app.status === 'Accepted' ? 'bg-green-50 border-green-200' :
                            app.status === 'Rejected' || app.status === 'Cancelled' ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                        }`}>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {app.type === 'Emergency' ? 'Emergency Request' : 'Appointment'}
                                {app.mentor ? ` with ${app.mentor.name}` : ' (Unassigned)'}
                            </h3>
                            <p className="text-gray-700 mb-1">
                                <span className="font-medium">Date:</span> {new Date(app.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700 mb-1">
                                <span className="font-medium">Time:</span> {app.time}
                            </p>
                            <p className="text-gray-700 mb-1">
                                <span className="font-medium">Status:</span>{' '}
                                <span className={`font-bold ${
                                    app.status === 'Pending' ? 'text-yellow-600' :
                                    (app.status === 'Accepted' && app.type === 'Regular') ? 'text-green-600' : // Regular accepted
                                    (app.status === 'Accepted' && app.type === 'Emergency') ? 'text-blue-600' : // Emergency accepted (new color)
                                    app.status === 'Rejected' || app.status === 'Cancelled' ? 'text-red-600' :
                                    'text-gray-600'
                                }`}>
                                    {/* NEW: Conditional display for emergency accepted status */}
                                    {app.type === 'Emergency' && app.status === 'Accepted' ? 'Completed' : app.status}
                                </span>
                            </p>
                            {app.notes && <p className="text-gray-700 mb-3"><span className="font-medium">Notes:</span> {app.notes}</p>}
                            {app.status === 'Pending' && (
                                <button
                                    onClick={() => handleCancelAppointment(app._id)}
                                    className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                                >
                                    Cancel Request
                                </button>
                            )}
                            {app.type === 'Emergency' && app.status === 'Accepted' && app.mentor && (
                                <button
                                    onClick={() => window.alert(`Chat with ${app.mentor.name} is recommended for this emergency. You can find them in the 'Connect with Mentors' tab.`)}
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                >
                                    Chat with Mentor
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default StudentAppointmentsTab;
