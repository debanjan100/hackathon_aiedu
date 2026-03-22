require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');

const app = express();
app.use(cors());
app.use(express.json());

// Environments
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aiedu';
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'ai_edu_secret_key_change_in_production';
const RAZORPAY_KEY = process.env.RAZORPAY_KEY || 'YOUR_KEY';
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || 'YOUR_SECRET';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY';

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// ─────────── Mongoose Models ─────────── //
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String, contact: String, profilePic: String, skillLevel: { type: String, default: 'Beginner' }
});
const User = mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({ title: String, type: String, content: String, price: Number });
const Course = mongoose.model('Course', CourseSchema);

const TaskSchema = new mongoose.Schema({ userId: String, task: String, status: { type: Boolean, default: false } });
const Task = mongoose.model('Task', TaskSchema);

const ProgressSchema = new mongoose.Schema({ userId: String, courseId: String, score: Number });
const Progress = mongoose.model('Progress', ProgressSchema);

// Razorpay Instance
const razorpay = new Razorpay({ key_id: RAZORPAY_KEY, key_secret: RAZORPAY_SECRET });

// ─────────── Auth Routes ─────────── //
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, contact });
    await newUser.save();

    res.json({ message: 'User created effectively!' });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY);
    res.json({ token, user: { name: user.name, email: user.email, skillLevel: user.skillLevel } });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

// Mock Google Auth (OAuth would use passport-google-oauth20)
app.post('/google-auth', async (req, res) => {
  res.json({ message: "Google Auth successfully mocked for this demo." });
});

// ─────────── Task / Planner Routes ─────────── //
app.get('/tasks/:userId', async (req, res) => {
  const tasks = await Task.find({ userId: req.params.userId });
  res.json(tasks);
});
app.post('/tasks', async (req, res) => {
  const t = new Task(req.body);
  await t.save();
  res.json(t);
});

// ─────────── Payment Routes (Razorpay) ─────────── //
app.post('/create-order', async (req, res) => {
  try {
    const options = { amount: 49900, currency: "INR", receipt: "receipt#1" };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.json({ id: `mock_order_${Date.now()}`, amount: 49900, currency: 'INR' });
  }
});

app.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_signature) return res.json({ success: true }); // Demo fallback

  const generated_signature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) res.json({ success: true });
  else res.status(400).json({ success: false });
});

// ─────────── Real AI Chat (Gemini) ─────────── //
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userMessage }]
          }
        ]
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't understand that.";

    res.json({ reply });

  } catch (err) {
    console.error("Chatbot Error:", err.response?.data || err.message);
    res.status(500).json({ reply: "AI server error. Try again." });
  }
});

app.listen(PORT, () => console.log(`🚀 AI Edu API running on http://localhost:${PORT}`));
