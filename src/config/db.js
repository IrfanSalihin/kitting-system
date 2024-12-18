require('dotenv').config(); // Make sure to load the environment variables
const mysql = require('mysql2');

// Make sure the environment variables are being used correctly
const db = mysql.createConnection({
    host: process.env.DB_HOST,        // 'localhost'
    user: process.env.DB_USER,        // 'root'
    password: process.env.DB_PASSWORD, // 'N@121212'
    database: process.env.DB_NAME     // 'kitting_system'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);  // Exit process if connection fails
    }
    console.log('Connected to the MySQL database');
});

module.exports = db;
