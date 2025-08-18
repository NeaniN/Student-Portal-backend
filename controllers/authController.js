const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = 'your_jwt_secret';

// In-memory store for reset tokens
const resetTokens = new Map();

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '3d' }
  );
};

// 🔐 Register new user
exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔑 Login user and return JWT
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = createToken(user);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔁 Forgot Password: Generate and send reset link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 min

    resetTokens.set(resetToken, { userId: user._id, expiresAt });

    // Replace with your actual email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
      }
    });

    const resetLink = `http://localhost:5500/reset-password.html?token=${resetToken}`;

    await transporter.sendMail({
      to: email,
      from: 'no-reply@studentportal.com',
      subject: 'Password Reset Link',
      html: `<p>Click to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔁 Reset Password: Accept token and update password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const tokenData = resetTokens.get(token);

  if (!tokenData || tokenData.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  try {
    const user = await User.findById(tokenData.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    resetTokens.delete(token);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during reset' });
  }
};



