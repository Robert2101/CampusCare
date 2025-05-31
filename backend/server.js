// server/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // Enable CORS for all origins

console.log('[server.js] Registering routes...'); // DEBUG LOG

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/emergency-appointments', require('./routes/emergencyAppointment'));
app.use('/api/utils', require('./routes/utils'));
app.use('/api/mood', require('./routes/mood')); // ENSURE THIS LINE IS PRESENT AND CORRECT!
// app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/helpline-call', require('./routes/helplineCall'));


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
