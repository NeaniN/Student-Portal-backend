require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

// Import routes
const listingRoutes = require('./routes/listingRoutes');

// Import scrapers
const scrapeCareersPortal = require('./scrapers/careersPortalScraper');
const scrapeIndeed = require('./scrapers/indeedScraper');
// const scrapeNsfas = require('./scrapers/nsfasScraper'); // Placeholder
// const scrapeSAYouth = require('./scrapers/sayouthScraper'); // Placeholder

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/listings', listingRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Function to run all scrapers
const runScrapers = async () => {
    console.log('🔄 Running scrapers...');
    try {
        await scrapeCareersPortal();
        await scrapeIndeed();
        // await scrapeNsfas();
        // await scrapeSAYouth();
        console.log('✅ All scrapers completed');
    } catch (err) {
        console.error('❌ Scraper error:', err);
    }
};

// Run scrapers on server start
runScrapers();

// Schedule scrapers every 12 hours
cron.schedule('0 */12 * * *', () => {
    runScrapers();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
