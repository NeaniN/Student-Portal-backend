const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');

router.get('/dashboard', requireAuth, (req, res) => {
  res.send(`Welcome ${req.user.email}, you have access to protected content!`);
});

module.exports = router;

