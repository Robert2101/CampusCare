import React, { useState } from 'react';

const StudentPodcastsTab = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    const podcasts = [
        {
            mood: 'Very Sad',
            level: 1,
            title: 'Comforting Podcasts To Listen When You Feel Very Sad',
            podcastName: 'Listen. Breathe. Begin.',
            links: ['https://www.youtube.com/watch?v=8i9iGR0zo1Y', 'https://www.youtube.com/watch?v=UHxh9cc-8-Q'],
            description:
                'These podcasts—featuring mental health experts, real-life stories, and spiritual guidance—are carefully chosen to help you feel heard, understood, and a little lighter.',
        },
        {
            mood: 'Neutral',
            level: 2,
            title: 'Grounding Podcasts To Listen When You Feel Neutral',
            podcastName: 'The Balanced Mind',
            links: ['https://www.youtube.com/watch?v=j8ZsDUhc8xo&t=352s', 'https://www.youtube.com/watch?v=sR6kWaHggeI'],
            description:
                'When you’re feeling neutral—not low, not high—it’s the perfect time to center yourself. These podcasts offer simple tools on mindfulness, daily habits, and self-awareness.',
        },
        {
            mood: 'Happy',
            level: 3,
            title: 'Celebrating Podcasts to Stay Calm While You\'re Happy',
            podcastName: 'Stay Calm, Stay Bright',
            links: ['https://www.youtube.com/watch?v=jgdMLSkJqVI', 'https://www.youtube.com/watch?v=sm0i1Y4g_zA'],
            description:
                'With tips on building positive habits, practicing gratitude, and embracing contentment without losing balance, they remind you that peace can coexist with excitement.',
        },
        {
            mood: 'Very Happy',
            level: 4,
            title: 'Celebrate Calmly: Podcasts for Very Happy Moments',
            podcastName: 'Gratitude Talks',
            links: ['https://www.youtube.com/watch?v=sZLibcDOEtg', 'https://www.youtube.com/watch?v=kZdsSlA3bzc'],
            description:
                'Explores topics surrounding love, relationships, and gratitude, encouraging listeners to appreciate and nurture their happiness.',
        },
        {
            mood: 'Ecstatic',
            level: 5,
            title: 'Ecstatic & Grounded Podcasts to Harness Your High Energy',
            podcastName: 'Stay Grounded, Shine Bright',
            links: ['https://www.youtube.com/watch?v=8zEIEUBRLyg', 'https://www.youtube.com/watch?v=hh45F8zbUB8'],
            description:
                'These podcasts provide gentle reminders and practical wisdom to help you stay calm, grounded, and mindful even in moments of ecstatic joy.',
        },
    ];

    const getEmbedUrl = (url) => {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const handleMoodSelect = (moodLevel) => {
        setSelectedMood(moodLevel);
        setActiveVideo(null);
    };

    const handleVideoSelect = (link) => {
        setActiveVideo(link);
    };

    const selectedPodcast = podcasts.find((p) => p.level === selectedMood);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-indigo-200 text-center">
                Podcast Recommendations
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto">
                Select your current mood to receive podcast recommendations that can support your mental well-being. Listen directly in your browser!
            </p>

            <div className="flex flex-wrap justify-center gap-4">
                {podcasts.map((podcast) => (
                    <button
                        key={podcast.level}
                        onClick={() => handleMoodSelect(podcast.level)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${selectedMood === podcast.level
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-800/50 text-gray-300 hover:bg-indigo-700/50'
                            }`}
                    >
                        {podcast.mood}
                    </button>
                ))}
            </div>

            {selectedMood && selectedPodcast ? (
                <div className="bg-gray-900/50 p-6 rounded-lg shadow-md border border-indigo-500/30">
                    <h3 className="text-xl font-semibold text-indigo-200 mb-4">{selectedPodcast.title}</h3>
                    <p className="text-gray-400 mb-4">{selectedPodcast.description}</p>
                    <p className="text-indigo-300 font-medium mb-4">Podcast: {selectedPodcast.podcastName}</p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {selectedPodcast.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => handleVideoSelect(link)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeVideo === link
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                        : 'bg-gray-800/50 text-gray-300 hover:bg-indigo-700/50'
                                    }`}
                            >
                                Listen to Episode {index + 1}
                            </button>
                        ))}
                    </div>

                    {activeVideo && (
                        <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden shadow-lg border border-indigo-500/30">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={getEmbedUrl(activeVideo)}
                                title="Podcast Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-400">Please select a mood to view podcast recommendations.</div>
            )}
        </div>
    );
};

export default StudentPodcastsTab;