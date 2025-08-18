// controllers/listingController.js
const Listing = require('../models/Listing');

// Get all listings, optionally filtered by type
const getListings = async (req, res) => {
    try {
        const { type } = req.query;
        let filter = {};
        if (type) {
            filter.type = type.toLowerCase();
        }
        const listings = await Listing.find(filter).sort({ datePosted: -1 });
        res.status(200).json(listings);
    } catch (err) {
        console.error('❌ Error fetching listings:', err);
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};

module.exports = {
    getListings
};
