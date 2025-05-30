// client/src/components/StudentMentorsTab.jsx
import React from 'react';

const StudentMentorsTab = ({ mentors, startChat, handleBookAppointmentClick }) => {
    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Connect with Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.length === 0 ? (
                    <p className="text-center text-gray-600 col-span-full">No mentors available at the moment.</p>
                ) : (
                    mentors.map(mentor => (
                        <div key={mentor._id} className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-200">
                            <h2 className="text-2xl font-bold text-blue-800 mb-2">{mentor.name}</h2>
                            <p className="text-gray-700 mb-4">{mentor.email}</p>
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={() => startChat(mentor._id)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                >
                                    Chat Anonymously
                                </button>
                                <button
                                    onClick={() => handleBookAppointmentClick(mentor)}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
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
