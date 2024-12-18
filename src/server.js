require('dotenv').config(); // Make sure to load the environment variables
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const { ensureLoggedIn } = require('./middlewares/authMiddleware');
require('./config/env');
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static('public'));
app.use(authRoutes);

app.get('/home', ensureLoggedIn, (req, res) => {
    res.send(`
        <h1>Welcome to the Kitting System</h1>
        <p>You are logged in as ${req.session.user}</p>
        <p>Your role: ${req.session.role}</p>
        <a href="/logout">Logout</a>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
