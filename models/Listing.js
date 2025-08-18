const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, default: '' },
    location: { type: String, default: '' },
    type: { type: String, enum: ['internship', 'learnership', 'bursary', 'other'], default: 'other' },
    link: { type: String, required: true },
    source: { type: String, required: true }, // e.g. 'CareersPortal', 'Indeed'
    datePosted: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
