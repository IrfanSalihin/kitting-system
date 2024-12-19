const bcrypt = require("bcryptjs");
const db = require("../config/db");

exports.register = (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).send("All fields are required.");
  }

  const checkQuery = "SELECT * FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).send("Database error.");

    if (results.length > 0) {
      return res.status(400).send("Username already taken.");
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).send("Password hashing error.");

      const insertQuery =
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
      db.query(insertQuery, [username, hashedPassword, role], (err) => {
        if (err) return res.status(500).send("Error saving user.");
        res.send("Registration successful!");
      });
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? COLLATE utf8mb4_bin";
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).send("Database error.");

    if (results.length === 0)
      return res.status(401).send("Invalid credentials.");

    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) return res.status(500).send("Password comparison error.");
      if (!isMatch) return res.status(401).send("Invalid credentials.");

      req.session.userId = results[0].id;
      req.session.username = username;
      req.session.role = results[0].role;

      if (results[0].role === "admin") {
        return res.redirect("/admin-home");
      } else {
        return res.redirect("/user-home");
      }
    });
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed.");
    res.redirect("/login.html"); // Assuming you want to redirect to login page on logout
  });
};
