const db = require('../config/db');

// Get user by username
const getUserByUsername = (username, callback) => {
    const query = 'SELECT * FROM users WHERE username = ? COLLATE utf8mb4_bin';
    db.query(query, [username], callback);
};

// Create new user
const createUser = (userData, callback) => {
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(query, [userData.username, userData.password, userData.role], callback);
};

module.exports = { getUserByUsername, createUser };
