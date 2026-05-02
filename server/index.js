// ====================================
// Imports / Constants
// ====================================

require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');
const { register, login, getMe, logout } = require('./controllers/authControllers');
const { updateUser, deleteUser } = require('./controllers/userControllers');
const { listEvents, listUserEvents, createEvent, updateEvent, deleteEvent } = require('./controllers/eventControllers');
const { createRsvp, deleteRsvp, listUserRsvps } = require('./controllers/rsvpControllers');

const app = express();
const PORT = process.env.PORT || 8080;

// Use dist (requires building the frontend) in production environment
const pathToFrontend = process.env.NODE_ENV === 'production' ? '../frontend/dist' : '../frontend';

// ====================================
// Middleware
// ====================================

app.use(logRoutes);
app.use(cookieSession({ name: 'session', secret: process.env.SESSION_SECRET }));
app.use(express.json());
app.use(express.static(path.join(__dirname, pathToFrontend)));

// ====================================
// Auth routes
// ====================================

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', getMe);
app.delete('/api/auth/logout', logout);

// ====================================
// User routes
// ====================================

app.patch('/api/users/:user_id', checkAuthentication, updateUser);
app.delete('/api/users/:user_id', checkAuthentication, deleteUser);

// ====================================
// Event routes
// ====================================

app.get('/api/events', listEvents);
app.get('/api/users/:user_id/events', listUserEvents);
app.post('/api/events', checkAuthentication, createEvent);
app.patch('/api/events/:event_id', checkAuthentication, updateEvent);
app.delete('/api/events/:event_id', checkAuthentication, deleteEvent);

// ====================================
// RSVP routes
// ====================================

app.post('/api/events/:event_id/rsvps', checkAuthentication, createRsvp);
app.delete('/api/events/:event_id/rsvps', checkAuthentication, deleteRsvp);
app.get('/api/users/:user_id/rsvps', listUserRsvps);

// ====================================
// Global Error Handling
// ====================================

// Notice that this error handler has **four** parameters.
const handleError = (err, req, res, next) => {
    console.error(err);
    res.status(500).send({ message: 'Internal Server Error' });
};
app.use(handleError);

// ====================================
// Listen
// ====================================

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));