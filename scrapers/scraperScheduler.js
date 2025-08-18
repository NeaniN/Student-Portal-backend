// scraperScheduler.js
const cron = require('node-cron');

// Import scrapers from the same folder
const scrapeCareersPortal = require('./careersPortalScraper');
const scrapeIndeedSA = require('./indeedScraper');
const scrapeNSFAS = require('./nsfasScraper');
const scrapeSAYouth = require('./saYouthScraper');

async function runAllScrapers() {
  console.log('🔄 Scraper job started at', new Date().toLocaleString());

  // Careers Portal
  try {
    console.log('📡 Running Careers Portal scraper...');
    await scrapeCareersPortal();
    console.log('✅ Careers Portal scraper completed successfully.');
  } catch (err) {
    console.error('❌ Careers Portal scraper failed:', err.message);
  }

  // Indeed SA
  try {
    console.log('📡 Running Indeed SA scraper...');
    await scrapeIndeedSA();
    console.log('✅ Indeed SA scraper completed successfully.');
  } catch (err) {
    console.error('❌ Indeed SA scraper failed:', err.message);
  }

  // NSFAS
  try {
    console.log('📡 Running NSFAS scraper...');
    await scrapeNSFAS();
    console.log('✅ NSFAS scraper completed successfully.');
  } catch (err) {
    console.error('❌ NSFAS scraper failed:', err.message);
  }

  // SAYouth
  try {
    console.log('📡 Running SAYouth scraper...');
    await scrapeSAYouth();
    console.log('✅ SAYouth scraper completed successfully.');
  } catch (err) {
    console.error('❌ SAYouth scraper failed:', err.message);
  }

  console.log('🏁 Scraper job finished at', new Date().toLocaleString());
}

// Schedule: 8AM and then every 4 hours
cron.schedule('0 8,12,16,20,0,4 * * *', () => {
  runAllScrapers();
});
