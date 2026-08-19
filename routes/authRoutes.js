// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/database");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name.trim(), email.toLowerCase().trim(), passwordHash);

  req.session.userId = result.lastInsertRowid;
  req.session.userName = name.trim();

  res.status(201).json({ id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase().trim() });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;

  res.json({ id: user.id, name: user.name, email: user.email });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json({ user: null });
  }
  res.json({ user: { id: req.session.userId, name: req.session.userName } });
});

module.exports = router;
