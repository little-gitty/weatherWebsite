require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const axios    = require("axios");
const cors     = require("cors");
const City     = require("./models/City");
const User     = require("./models/User");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Database ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ── Auth Routes ───────────────────────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Create new user
    const user = await User.create({ username, email, password });
    res.status(201).json({ message: "User registered successfully", userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({ message: "Login successful", userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
});

// ── Weather Route ─────────────────────────────────────────────
app.get("/api/weather/:city", async (req, res) => {
  const { city } = req.params;
  const apiKey   = process.env.OPENWEATHER_API_KEY;

  try {
    const url      = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const data     = response.data;

    res.json({
      city:        data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      lat:         data.coord.lat,
      lon:         data.coord.lon,
    });
  } catch (err) {
    const status = err.response?.status === 404 ? 404 : 500;
    const msg    = status === 404 ? "City not found" : "Failed to fetch weather";
    res.status(status).json({ error: msg });
  }
});

// ── Cities CRUD ───────────────────────────────────────────────

// GET all (for specific user)
app.get("/api/cities/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cities = await City.find({ userId }).sort({ _id: -1 });
    res.json(cities);
  } catch {
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

// POST create
app.post("/api/cities", async (req, res) => {
  const { userId, name, lat, lon } = req.body;
  if (!userId || !name || lat == null || lon == null)
    return res.status(400).json({ error: "userId, name, lat, and lon are required" });

  try {
    const city = await City.create({ userId, name, lat, lon });
    
    // Add city to user's cities array
    await User.findByIdAndUpdate(
      userId,
      { $push: { cities: city._id } },
      { new: true }
    );
    
    res.status(201).json(city);
  } catch {
    res.status(500).json({ error: "Failed to save city" });
  }
});

// PUT update
app.put("/api/cities/:id", async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json(city);
  } catch {
    res.status(500).json({ error: "Failed to update city" });
  }
});

// DELETE
app.delete("/api/cities/:id", async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    
    // Remove city from user's cities array
    await User.findByIdAndUpdate(
      city.userId,
      { $pull: { cities: city._id } }
    );
    
    res.json({ message: "City deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete city" });
  }
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
