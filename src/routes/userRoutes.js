// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Home page route
router.get('/home', (req, res) => {
    if (req.session.role === 'admin') {
        res.render('admin-home');  // Admin homepage view
    } else if (req.session.role === 'user') {
        res.render('user-home');  // User homepage view
    } else {
        res.redirect('/login');
    }
});

// Route to display the form to add a kitting record
router.get('/add-kitting', (req, res) => {
    if (req.session.role === 'admin' || req.session.role === 'user') {
        res.render('add-kitting');  // The page to add a kitting record
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
