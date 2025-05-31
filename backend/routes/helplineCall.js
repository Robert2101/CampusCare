// server/routes/helplineCall.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware for authentication
const twilio = require('twilio'); // Twilio SDK

// Load environment variables for Twilio (ensure these are set in your .env and loaded by your main server file)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number
const helplineNumber = process.env.EMERGENCY_HELPLINE_NUMBER; // The real helpline number to call

// Initialize Twilio client
const client = new twilio(accountSid, authToken);

// @route   POST /api/helpline-call/trigger
// @desc    Trigger a Twilio call to an emergency helpline
// @access  Private (requires authentication)

router.post('/trigger', auth, async (req, res) => {
    try {
        // Ensure Twilio client is properly initialized with environment variables
        // These should be loaded at the top of your file (e.g., using dotenv)


        if (!helplineNumber || !twilioPhoneNumber || !accountSid || !authToken) {
            console.error('Server-side Twilio configuration is incomplete. Check environment variables.');
            return res.status(500).json({ msg: 'Server-side Twilio configuration is incomplete.' });
        }

        const client = require('twilio')(accountSid, authToken); // Initialize Twilio client here if not globally

        // Log who initiated the call
        if (req.user) {
            console.log(`Helpline call initiated by user: ${req.user.id} (${req.user.email})`);
        } else {
            console.warn('Helpline call endpoint hit without authenticated user context.');
        }

        // --- NEW: Define TwiML instructions directly ---
        // For a simple call, you might want to play a message and then connect them.
        // You can build this XML string dynamically.
        const twimlInstructions = `
    <Response>
      <Say voice="woman" language="en-US">
        Please hold. You are being connected to a crisis helpline. You are not alone, and help is available.
      </Say>
      <Dial>
        <Number>+14406592937</Number>
      </Dial>
    </Response>
`;

        // Alternatively, if you just want to play a message and hang up:
        

        // Initiate the call using Twilio with the 'twiml' parameter
        const call = await client.calls.create({
            twiml: twimlInstructions, // Provide the TwiML XML string directly
            to: helplineNumber,
            from: twilioPhoneNumber,
        });

        console.log(`Twilio call initiated with SID: ${call.sid}`);
        res.status(200).json({ msg: 'Emergency helpline call initiated successfully!', callSid: call.sid });

    } catch (error) {
        console.error('Error initiating emergency call:', error.message);
        // Provide more specific error if it's a Twilio API error
        if (error.status) { // Twilio API errors often have a 'status' property
            res.status(error.status).json({ msg: `Twilio API Error: ${error.message}`, code: error.code });
        } else {
            res.status(500).json({ msg: 'Failed to initiate emergency helpline call.', error: error.message });
        }
    }
});

module.exports = router;