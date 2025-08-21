// scrapers/sayouthScraper.js
const Listing = require("../models/Listing");

const scrapeSAYouth = async () => {
  try {
    console.log("SAYouth requires login/captcha. Skipping scrape gracefully.");
    // If you get a public feed later, transform & save like:
    // await Listing.create({ title, link, company, location, type: 'opportunity', source: 'SAYouth' });
  } catch (err) {
    console.error("❌ SAYouth scraper error:", err.message);
  }
};

module.exports = scrapeSAYouth;
