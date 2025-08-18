// routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const { getListings } = require('../controllers/listingController');

// GET /api/listings?type=internship
router.get('/', getListings);

module.exports = router;
