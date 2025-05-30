import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const QUESTION_COUNT_THRESHOLD = 2;

export default function PsychiatristChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [questionCount, setQuestionCount] = useState(0);
    const [moodDetermined, setMoodDetermined] = useState(false);
    const chatContainerRef = useRef(null);

    const API_KEY = 'AIzaSyAKbS_BDZyPi3vxxE6_I4VmnTkb7UipF64';
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const formatMessagesForGeminiHistory = (msgs) => {
        return msgs.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const sendInitialGreeting = async () => {
            setLoading(true);
            try {
                const systemInstruction = {
                    role: 'user',
                    parts: [
                        {
                            text: `You are a compassionate AI trained to act like a supportive mental health assistant.
              Always respond with kindness, empathy, and thoughtful questions.
              Never give medical advice or pretend to be a doctor.

              Your goal is to understand the user's mood and feelings over a few interactions.
              
              **Phase 1: Questioning (First ${QUESTION_COUNT_THRESHOLD} AI responses)**
              For your first ${QUESTION_COUNT_THRESHOLD} responses, you should ask open-ended, empathetic questions to gather more information about the user's feelings, experiences, and current situation. Do NOT determine the mood yet. End each response with a question.

              **Phase 2: Mood Assessment (After ${QUESTION_COUNT_THRESHOLD} AI responses)**
              After you have asked ${QUESTION_COUNT_THRESHOLD} questions (meaning the user has responded ${QUESTION_COUNT_THRESHOLD} times to your questions), your next response should perform a concise mood analysis based on all previous interactions.
              State the user's perceived mood clearly (e.g., "Based on our conversation, I sense you might be feeling anxious/sad/overwhelmed/optimistic.").
              Then, ask a final, open-ended question to encourage further discussion based on your assessment.
              You must signal the end of the mood assessment by starting your response with "Mood Assessment:"
              `
                        }
                    ]
                };

                const chat = model.startChat({
                    history: [systemInstruction],
                    generationConfig: { maxOutputTokens: 300 },
                });

                const initialAIResponse = await chat.sendMessage("Initial greeting to start the conversation.");
                const responseText = initialAIResponse.response.text();

                setMessages([{ role: 'assistant', text: responseText }]);
                setQuestionCount(1);
            } catch (err) {
                console.error("Error sending initial greeting to Gemini API:", err);
                setError("Failed to start the chat. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        sendInitialGreeting();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const systemInstruction = {
                role: 'user',
                parts: [
                    {
                        text: `You are a highly compassionate and experienced AI psychiatrist. Your core purpose is to provide a safe, non-judgmental, and understanding space for the user to explore their thoughts and feelings.

      **Your guiding principles:**
      * **Empathy First:** Always respond with genuine warmth, understanding, and validation.
      * **Thoughtful Inquiry:** Ask open-ended, insightful questions that encourage deeper reflection and elaboration, going beyond surface-level responses.
      * **No Medical Advice:** Under no circumstances should you diagnose, prescribe, or offer medical advice. Your role is supportive and exploratory, not clinical treatment.
      * **Focus on Feelings:** Gently guide the conversation towards the user's emotional state, their experiences, and how these factors intertwine.

      **Conversation Flow:**

      **Phase 1: Deep Exploration (First ${QUESTION_COUNT_THRESHOLD} AI responses)**
      For your initial ${QUESTION_COUNT_THRESHOLD} responses, your primary objective is to gain a comprehensive understanding of the user's current emotional landscape and the context surrounding it.
      * **Vary your opening questions:** Instead of simply asking "How are you feeling?", try different approaches like:
          * "Welcome. I'm here to listen. What's been on your mind lately?"
          * "It takes courage to reach out. What brings you here today, and how can I best support you?"
          * "Thank you for sharing your time with me. Could you tell me a little about what's been weighing on you recently?"
          * "I'm ready to hear what you'd like to share. How have things been for you emotionally?"
      * **Follow-up questions:** Each response should end with a thoughtful, empathetic question designed to delve deeper into their feelings, the origins of those feelings, or how they manifest. Avoid yes/no questions.
      * **Do NOT attempt a mood analysis during this phase.**

      **Phase 2: Compassionate Assessment (After ${QUESTION_COUNT_THRESHOLD} AI responses)**
      Once you have asked ${QUESTION_COUNT_THRESHOLD} questions (meaning the user has provided ${QUESTION_COUNT_THRESHOLD} responses to your direct inquiries), your *next* response will be a concise, empathetic mood assessment based on the entire conversation.
      * **Formulate the assessment:** Clearly state your perception of their core emotional state(s) in a gentle and supportive manner. Use phrases like: "Based on our conversation, it sounds like you've been grappling with...", or "From what you've shared, I'm sensing elements of...", or "It seems you're navigating feelings of...".
      * **Validate their experience:** Briefly acknowledge the difficulty or complexity of their feelings.
      * **Open for further discussion:** Conclude with an open-ended question that invites them to either confirm the assessment, elaborate further, or shift focus to another aspect of their feelings.
      * **Crucial:** You must signal the end of the questioning phase and the start of the assessment by beginning your response with: "### MOOD_ASSESSMENT_COMPLETE ###" (use this exact phrase for programmatic detection). Immediately after this marker, provide your empathetic mood analysis.
      `
                    }
                ]
            };

            const conversationHistory = formatMessagesForGeminiHistory(messages);

            const chat = model.startChat({
                history: [systemInstruction, ...conversationHistory],
                generationConfig: { maxOutputTokens: 200 },
            });

            const result = await chat.sendMessage(input);
            const response = await result.response;
            let aiResponseText = response.text();

            if (!moodDetermined && aiResponseText && !aiResponseText.startsWith("Mood Assessment:")) {
                setQuestionCount(prevCount => prevCount + 1);
            } else if (aiResponseText && aiResponseText.startsWith("Mood Assessment:")) {
                setMoodDetermined(true);
                aiResponseText = aiResponseText.replace("Mood Assessment:", "").trim();
            }

            setMessages([...updatedMessages, { role: 'assistant', text: aiResponseText }]);

        } catch (err) {
            console.error("Error communicating with Gemini API:", err);
            setError(err.message || "Something went wrong with the AI. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-900 p-6 flex items-center space-x-3">
                    <div className="bg-indigo-700 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">MindfulAI Companion</h1>
                        <p className="text-indigo-200 text-sm">Your confidential mental health space</p>
                    </div>
                </div>

                {/* Chat container */}
                <div 
                    ref={chatContainerRef} 
                    className="h-96 p-4 overflow-y-auto space-y-4 bg-gray-800"
                    style={{ background: 'radial-gradient(circle at center, #2d3748 0%, #1a202c 100%)' }}
                >
                    {messages.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-center">The AI is preparing your personalized session...</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${m.role === 'assistant' ? 'bg-gray-700 text-gray-100 rounded-bl-none' : 'bg-indigo-600 text-white rounded-br-none'}`}>
                                <div className="font-medium text-xs mb-1 opacity-70">
                                    {m.role === 'assistant' ? 'MindfulAI' : 'You'}
                                </div>
                                <p className="whitespace-pre-wrap">{m.text}</p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 rounded-lg rounded-bl-none px-4 py-2 max-w-xs">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status indicators */}
                <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
                    {error && (
                        <div className="flex items-center bg-red-900/50 text-red-200 px-3 py-2 rounded mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {moodDetermined && (
                        <div className="flex items-center bg-green-900/30 text-green-300 px-3 py-2 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Mood assessment complete. We can continue our conversation.
                        </div>
                    )}
                </div>

                {/* Input area */}
                <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Share your thoughts..."
                            disabled={loading}
                            required
                        />
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45 -mr-1 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        This is not a substitute for professional help. If you're in crisis, please contact a licensed professional.
                    </p>
                </form>
            </div>
        </div>
    );
}