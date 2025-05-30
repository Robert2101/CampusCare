import React from 'react';

const StudentAppointmentsTab = ({ myAppointments, handleCancelAppointment }) => {
    return (
        <div className="mt-8">
            <h2 className="text-3xl font-bold text-indigo-200 mb-6 border-b-2 border-indigo-500/50 pb-2">
                Your Appointments
            </h2>
            {myAppointments.length === 0 ? (
                <p className="text-center text-gray-400">No appointments scheduled yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myAppointments.map((app) => (
                        <div
                            key={app._id}
                            className={`p-6 rounded-lg shadow-md border ${app.status === 'Pending'
                                    ? 'bg-yellow-900/20 border-yellow-500/50'
                                    : app.status === 'Accepted'
                                        ? 'bg-green-900/20 border-green-500/50'
                                        : app.status === 'Rejected' || app.status === 'Cancelled'
                                            ? 'bg-red-900/20 border-red-500/50'
                                            : 'bg-gray-900/20 border-gray-500/50'
                                }`}
                        >
                            <h3 className="text-xl font-semibold text-indigo-200 mb-2">
                                Appointment with {app.mentor ? app.mentor.name : 'Unassigned (Emergency)'}
                            </h3>
                            <p className="text-gray-300 mb-1">
                                <span className="font-medium">Date:</span> {new Date(app.date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-300 mb-1">
                                <span className="font-medium">Time:</span> {app.time}
                            </p>
                            <p className="text-gray-300 mb-1">
                                <span className="font-medium">Type:</span> {app.type}
                            </p>
                            <p className="text-gray-300 mb-1">
                                <span className="font-medium">Status:</span>{' '}
                                <span
                                    className={`font-bold ${app.status === 'Pending'
                                            ? 'text-yellow-400'
                                            : app.status === 'Accepted'
                                                ? 'text-green-400'
                                                : app.status === 'Rejected' || app.status === 'Cancelled'
                                                    ? 'text-red-400'
                                                    : 'text-gray-400'
                                        }`}
                                >
                                    {app.status}
                                </span>
                            </p>
                            {app.notes && (
                                <p className="text-gray-300 mb-3">
                                    <span className="font-medium">Your Notes:</span> {app.notes}
                                </p>
                            )}
                            {app.mentorDescription && app.status === 'Completed' && (
                                <p className="text-gray-300 mb-3">
                                    <span className="font-medium">Mentor's Notes:</span> {app.mentorDescription}
                                </p>
                            )}
                            {app.status === 'Pending' && (
                                <button
                                    onClick={() => handleCancelAppointment(app._id)}
                                    className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Cancel Appointment
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentAppointmentsTab;