import React from 'react';

const StudentMentorsTab = ({ mentors, startChat, handleBookAppointmentClick }) => {
    return (
        <section>
            <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-white/30 bg-gradient-to-r from-white to-[#fff7e6] bg-clip-text text-transparent">
                Connect with Mentors
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.length === 0 ? (
                    <p className="text-center text-gray-400 col-span-full">No mentors available at the moment.</p>
                ) : (
                    mentors.map((mentor) => (
                        <div
                            key={mentor._id}
                            className="bg-gray-900/70 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-teal-500/20 hover:border-teal-500/40"
                        >
                            <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-white/30 bg-gradient-to-r from-white to-[#fff7e6] bg-clip-text text-transparent">{mentor.name}</h2>
                            <p className="text-gray-400 text-sm mb-4">{mentor.email}</p>

                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => startChat(mentor._id)}
                                    className="w-full flex items-center justify-between px-6 py-3 rounded-full text-white font-medium text-base 
             bg-gradient-to-r from-[#2e2e3a] via-[#3c2d35] to-[#d3a46f] 
             transition-all duration-500 bg-[length:200%_100%] bg-left hover:bg-right"
                                >
                                    Chat Anonymously
                                    <span className="ml-2 text-xl">→</span>
                                </button>

                                <button
                                    onClick={() => handleBookAppointmentClick(mentor)}
                                    className="w-full flex items-center justify-between px-6 py-3 rounded-full text-white font-medium text-base 
             bg-gradient-to-r from-[#2e2e3a] via-[#3c2d35] to-[#d3a46f] 
             transition-all duration-500 bg-[length:200%_100%] bg-left hover:bg-right"
                                >
                                    Book Appointment
                                    <span className="ml-2 text-xl">→</span>
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