const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected dashboard route
router.get('/dashboard', requireAuth, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}` });
});

module.exports = router;

