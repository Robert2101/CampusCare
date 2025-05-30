// server/routes/chat.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET api/chat/mentors
// @desc    Get all mentors
// @access  Private (Students only)
router.get('/mentors', auth, async (req, res) => {
    try {
        // Only students can request mentors
        if (req.user.role !== 'Student') {
            return res.status(403).json({ msg: 'Access denied. Only students can view mentors.' });
        }
        const mentors = await User.find({ role: 'Mentor' }).select('-password');
        res.json(mentors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chat/conversations  <-- THIS ROUTE IS NOW PLACED BEFORE THE DYNAMIC ID ROUTE
// @desc    Get list of users current user has chatted with (for dashboard display)
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all unique users current user has sent messages to or received messages from
        const sentTo = await Message.distinct('receiver', { sender: userId });
        const receivedFrom = await Message.distinct('sender', { receiver: userId });

        const chattedUserIds = [...new Set([...sentTo, ...receivedFrom])];

        // Filter out self if present
        const filteredUserIds = chattedUserIds.filter(id => id.toString() !== userId.toString());

        const conversationPartners = await User.find({ _id: { $in: filteredUserIds } }).select('name email role');

        res.json(conversationPartners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/chat/:receiverId   <-- THIS DYNAMIC ROUTE IS NOW PLACED AFTER /conversations
// @desc    Get chat history between current user and a specific receiver
// @access  Private
router.get('/:receiverId', auth, async (req, res) => {
    try {
        const { receiverId } = req.params;
        const userId = req.user.id;

        // Find messages where current user is sender and receiverId is receiver, OR vice versa
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: receiverId },
                { sender: receiverId, receiver: userId }
            ]
        }).sort('timestamp') // Sort by timestamp to get chronological order
          .populate('sender', 'name role') // Populate sender's name and role
          .populate('receiver', 'name role'); // Populate receiver's name and role

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/chat/message
// @desc    Send a message
// @access  Private
router.post('/message', auth, async (req, res) => {
    const { receiverId, content, isAnonymous } = req.body;

    try {
        // Ensure the receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ msg: 'Receiver not found' });
        }

        // A student can send anonymous messages to a mentor
        if (req.user.role === 'Student' && receiver.role === 'Mentor' && isAnonymous) {
            const newMessage = new Message({
                sender: req.user.id, // Actual student ID stored
                receiver: receiverId,
                content,
                isAnonymous: true // Mark as anonymous
            });
            await newMessage.save();
            return res.json(newMessage);
        }
        // Mentors cannot send anonymous messages. Students can send non-anonymous messages (e.g., to other students, though not a core feature here).
        else if (req.user.role === 'Mentor' || !isAnonymous) {
             const newMessage = new Message({
                sender: req.user.id,
                receiver: receiverId,
                content,
                isAnonymous: false // Not anonymous
            });
            await newMessage.save();
            return res.json(newMessage);
        } else {
            return res.status(400).json({ msg: 'Invalid message parameters.' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;