// client/src/components/MoodTrackerTab.jsx
import React, { useState, useEffect } from 'react';
import { logMoodEntry, getMoodEntries } from '../api/mood';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'; // For date manipulation

// Emoji mapping for mood ratings (1-5)
const moodEmojis = {
    1: { emoji: '😞', label: 'Very Sad', color: 'text-red-500' },
    2: { emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    3: { emoji: '😊', label: 'Happy', color: 'text-green-500' },
    4: { emoji: '😄', label: 'Very Happy', color: 'text-blue-500' },
    5: { emoji: '🤩', label: 'Ecstatic', color: 'text-purple-500' },
};

const MoodTrackerTab = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedMood, setSelectedMood] = useState(null); // Will store the numerical rating (1-5)
    const [journalEntry, setJournalEntry] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [moodHistory, setMoodHistory] = useState([]); // All fetched mood entries

    const fetchMoodHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const entries = await getMoodEntries();
            setMoodHistory(entries);

            // Pre-fill form if there's an entry for today
            const todayEntry = entries.find(entry => format(new Date(entry.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
            if (todayEntry) {
                setSelectedMood(todayEntry.moodRating);
                setJournalEntry(todayEntry.journalEntry || '');
            } else {
                setSelectedMood(null);
                setJournalEntry('');
            }
        } catch (err) {
            setError(err.msg || 'Failed to fetch mood history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMoodHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!selectedMood || !selectedDate) {
            setError('Please select a mood and a date.');
            return;
        }

        try {
            const response = await logMoodEntry(selectedDate, selectedMood, journalEntry);
            setSuccess(response.msg); // Backend sends a message like 'Mood entry logged/updated successfully'
            fetchMoodHistory(); // Refresh history
            // Reset form for new entry, but keep today's date selected
            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            setSelectedMood(null);
            setJournalEntry('');
        } catch (err) {
            setError(err.msg || (err.errors && err.errors.length > 0 ? err.errors[0].msg : 'Failed to log mood.'));
            console.error(err);
        }
    };

    // --- Weekly Analytics ---
    const getWeeklyAnalytics = () => {
        const today = new Date();
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
        const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

        const daysInWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

        const weeklyData = daysInWeek.map(day => {
            const formattedDay = format(day, 'yyyy-MM-dd');
            const entryForDay = moodHistory.find(entry => format(new Date(entry.date), 'yyyy-MM-dd') === formattedDay);
            return {
                date: day,
                mood: entryForDay ? moodEmojis[entryForDay.moodRating] : null,
                journal: entryForDay ? entryForDay.journalEntry : null,
                rating: entryForDay ? entryForDay.moodRating : null
            };
        });

        // Simple average mood for the week
        const validRatings = weeklyData.filter(d => d.rating !== null).map(d => d.rating);
        const averageMood = validRatings.length > 0
            ? (validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length).toFixed(1)
            : 'N/A';

        // Simple tips based on average mood (can be expanded)
        let weeklyTip = '';
        if (averageMood !== 'N/A') {
            if (averageMood < 2.5) {
                weeklyTip = "It seems like you've had a challenging week. Remember to practice self-compassion and reach out if you need support. Small steps can make a big difference.";
            } else if (averageMood >= 2.5 && averageMood < 3.5) {
                weeklyTip = "Your week has been fairly balanced. Keep nurturing your well-being with consistent self-care practices.";
            } else {
                weeklyTip = "Great job maintaining a positive mood this week! Keep up the good habits that contribute to your well-being.";
            }
        } else {
            weeklyTip = "Log more moods to see your weekly insights!";
        }


        return { weeklyData, averageMood, weeklyTip };
    };

    const { weeklyData, averageMood, weeklyTip } = getWeeklyAnalytics();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px] bg-gray-100 rounded-lg">
                <div className="text-xl text-gray-700">Loading mood tracker...</div>
            </div>
        );
    }

    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 pb-2">Mood Tracker</h2>

            {/* Daily Check-in */}
            <div className="mb-12 p-6 bg-blue-50 rounded-lg shadow-md border border-blue-200">
                <h3 className="text-2xl font-bold text-blue-800 mb-4">How are you feeling today?</h3>
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="moodDate" className="block text-gray-700 text-sm font-semibold mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            id="moodDate"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            max={format(new Date(), 'yyyy-MM-dd')} // Prevent future dates
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Select your mood:
                        </label>
                        <div className="flex justify-around items-center p-3 border border-gray-300 rounded-lg bg-white">
                            {Object.entries(moodEmojis).map(([rating, { emoji, label }]) => (
                                <div
                                    key={rating}
                                    className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                                        selectedMood === parseInt(rating) ? 'bg-blue-200 scale-110 shadow-md' : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => setSelectedMood(parseInt(rating))}
                                >
                                    <span className="text-4xl">{emoji}</span>
                                    <span className="text-xs text-gray-600 mt-1">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="journal" className="block text-gray-700 text-sm font-semibold mb-2">
                            Journal Entry (Optional)
                        </label>
                        <textarea
                            id="journal"
                            value={journalEntry}
                            onChange={(e) => setJournalEntry(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                            placeholder="Write about your day, what influenced your mood, or anything on your mind..."
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    >
                        Log Mood
                    </button>
                </form>
            </div>

            {/* Weekly Mood Analytics */}
            <div className="p-6 bg-green-50 rounded-lg shadow-md border border-green-200">
                <h3 className="text-2xl font-bold text-green-800 mb-4">Your Weekly Mood</h3>
                <p className="text-lg text-gray-700 mb-4">
                    Average Mood this week: <span className="font-bold text-xl">{averageMood !== 'N/A' ? moodEmojis[Math.round(averageMood)]?.emoji || averageMood : averageMood}</span> ({averageMood})
                </p>
                <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
                    <p className="text-gray-800 italic">"{weeklyTip}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4 text-center">
                    {weeklyData.map(day => (
                        <div key={format(day.date, 'yyyy-MM-dd')} className="p-3 rounded-lg bg-white shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                            <p className="text-sm font-semibold text-gray-600">{format(day.date, 'EEE')}</p>
                            <p className="text-xs text-gray-500">{format(day.date, 'MMM d')}</p>
                            {day.mood ? (
                                <span className={`text-4xl mt-2 ${day.mood.color}`}>{day.mood.emoji}</span>
                            ) : (
                                <span className="text-4xl mt-2 text-gray-400">?</span>
                            )}
                            {day.journal && (
                                <p className="text-xs text-gray-700 mt-2 italic max-h-12 overflow-hidden">"{day.journal}"</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MoodTrackerTab;
