require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const db = require("./config/db"); // Ensure this points to your db.js file
const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs"); // Set EJS as the view engine

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Ensure this is correctly set in .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // If you use HTTPS, set `secure: true`
  })
);

// Routes
const authRoutes = require("./routes/authRoutes");
app.use(authRoutes);

// Home route
app.get("/home", (req, res) => {
  if (req.session.role === "admin") {
    return res.redirect("/admin-home");
  } else if (req.session.role === "user") {
    return res.redirect("/user-home");
  } else {
    return res.redirect("/login.html"); // Redirect to login if not authenticated
  }
});

// Home routes for admin and user
app.get("/admin-home", (req, res) => {
  if (req.session.role !== "admin") {
    return res.redirect("/home");
  }

  // Fetch records from the database for admin
  db.query("SELECT * FROM kitting_records", (err, results) => {
    if (err) {
      console.error("Error fetching records:", err);
      return res.status(500).send("Error fetching records.");
    }
    res.render("admin-home", {
      records: results,
      username: req.session.username,
    }); // Render records to admin-home.ejs
  });
});

app.get("/user-home", (req, res) => {
  if (req.session.role !== "user") {
    return res.redirect("/home");
  }

  // Fetch records from the database for user
  db.query("SELECT * FROM kitting_records", (err, results) => {
    if (err) {
      console.error("Error fetching records:", err);
      return res.status(500).send("Error fetching records.");
    }
    res.render("user-home", {
      records: results,
      username: req.session.username,
    }); // Render records to user-home.ejs
  });
});

// Add kitting record page (check if the user is logged in)
app.get("/add-kitting-record", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login.html"); // Redirect to login if not authenticated
  }
  res.render("add-kitting-record"); // Use EJS rendering here instead of sendFile
});

// Add kitting record (POST route)
app.post("/add-kitting-record", (req, res) => {
  const {
    customer,
    pick_list_number,
    instrument_names,
    requested_date,
    arrival_date,
    completion_date,
    user,
    serial_numbers,
    status,
    purpose,
    remarks,
    task_type,
  } = req.body;

  // Check if any required fields are missing
  if (
    !customer ||
    !pick_list_number ||
    !instrument_names ||
    !requested_date ||
    !user ||
    !serial_numbers ||
    !status ||
    !purpose ||
    !task_type
  ) {
    return res.status(400).send("All fields are required.");
  }

  const insertQuery = `
        INSERT INTO kitting_records (customer, pick_list_number, instrument_names, requested_date, arrival_date, completion_date, user, serial_numbers, status, purpose, remarks, task_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    insertQuery,
    [
      customer,
      pick_list_number,
      instrument_names,
      requested_date,
      arrival_date,
      completion_date,
      user,
      serial_numbers,
      status,
      purpose,
      remarks,
      task_type,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting record:", err);
        return res.status(500).send("Error inserting record.");
      }
      res.redirect("/home"); // Redirect after successful record insertion
    }
  );
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed.");
    res.redirect("/login.html");
  });
});

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
