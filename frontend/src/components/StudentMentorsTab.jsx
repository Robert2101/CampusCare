import React from 'react';

const StudentMentorsTab = ({ mentors, startChat, handleBookAppointmentClick }) => {
    return (
        <section>
            <h2 className="text-3xl font-bold text-indigo-200 mb-6 border-b-2 border-indigo-500/50 pb-2">
                Connect with Mentors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.length === 0 ? (
                    <p className="text-center text-gray-400 col-span-full">No mentors available at the moment.</p>
                ) : (
                    mentors.map((mentor) => (
                        <div
                            key={mentor._id}
                            className="bg-gray-900/50 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-indigo-500/30"
                        >
                            <h2 className="text-2xl font-bold text-indigo-200 mb-2">{mentor.name}</h2>
                            <p className="text-gray-400 mb-4">{mentor.email}</p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={() => startChat(mentor._id)}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    Chat Anonymously
                                </button>
                                <button
                                    onClick={() => handleBookAppointmentClick(mentor)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default StudentMentorsTab;