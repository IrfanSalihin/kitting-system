const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = 3000;

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Replace with your MySQL username
  password: 'N@121212',  // Replace with your MySQL password
  database: 'kitting_system',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware to parse request bodies and handle sessions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',  // This can be any string for session encryption
  resave: false,
  saveUninitialized: true,
}));

// Serve static files (HTML, CSS, etc.)
app.use(express.static('public'));

// Home Route (After login, this page will be displayed)
app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.status(403).send('You must be logged in to view the homepage');
  }
  res.send(`
    <h1>Welcome to the Kitting System</h1>
    <p>You are logged in as ${req.session.user}</p>
    <p>Your role: ${req.session.role}</p>
    <a href="/logout">Logout</a>
  `);
});

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? COLLATE utf8mb4_bin';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error checking user in the database', err);
      return res.status(500).send('Error checking user in the database');
    }

    if (results.length === 0) {
      return res.status(401).send('Invalid credentials');
    }

    // Compare passwords using bcrypt
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords', err);
        return res.status(500).send('Error comparing passwords');
      }

      if (!isMatch) {
        return res.status(401).send('Invalid credentials');
      }

      // Store user info in session
      req.session.user = username;
      req.session.role = results[0].role;  // Set the role in the session

      res.redirect('/home');
    });
  });
});

// Registration Route
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;

  // Validate input
  if (!username || !password || !role) {
    return res.status(400).send('All fields are required.');
  }

  // Check if the username already exists
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).send('Error checking username');
    }

    if (results.length > 0) {
      return res.status(400).send('Username already taken');
    }

    // Hash password before saving
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send('Error hashing password');
      }

      // Insert new user with hashed password and role
      const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
      db.query(query, [username, hashedPassword, role], (err, results) => {
        if (err) {
          console.error('Error saving user to the database:', err);
          return res.status(500).send(`Error saving user to the database: ${err.message}`);
        }

        res.send('Registration successful!');
      });
    });
  });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.redirect('/login.html');  // Redirect to login page after logout
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
