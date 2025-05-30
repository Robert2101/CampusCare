// client/src/components/AppointmentModal.jsx
import React, { useState } from 'react';
import { bookAppointment } from '../api/appointment';

const AppointmentModal = ({ isOpen, onClose, mentorId, mentorName, onAppointmentBooked }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Basic validation: ensure date and time are not empty
        if (!date || !time) {
            setError('Please select both a date and a time.');
            setLoading(false);
            return;
        }

        // Optional: Add more sophisticated date/time validation (e.g., future dates only)
        const selectedDateTime = new Date(`${date}T${time}`);
        if (selectedDateTime < new Date()) {
            setError('Please select a future date and time for the appointment.');
            setLoading(false);
            return;
        }

        try {
            await bookAppointment(mentorId, date, time, notes);
            setSuccess('Appointment booked successfully!');
            setDate('');
            setTime('');
            setNotes('');
            onAppointmentBooked(); // Notify parent component to refresh appointments
            setTimeout(() => {
                onClose(); // Close modal after a short delay
            }, 1500);
        } catch (err) {
            setError(err.msg || (err.errors && err.errors.length > 0 ? err.errors[0].msg : 'Failed to book appointment.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 relative">
                <button
                    onClick={() => {
                        onClose();
                        setError('');
                        setSuccess('');
                        setDate('');
                        setTime('');
                        setNotes('');
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Book Appointment with {mentorName}</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="appointmentDate" className="block text-gray-700 text-sm font-semibold mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            id="appointmentDate"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="appointmentTime" className="block text-gray-700 text-sm font-semibold mb-2">
                            Time
                        </label>
                        <input
                            type="time"
                            id="appointmentTime"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="appointmentNotes" className="block text-gray-700 text-sm font-semibold mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="appointmentNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            placeholder="e.g., I'd like to discuss stress management strategies."
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
