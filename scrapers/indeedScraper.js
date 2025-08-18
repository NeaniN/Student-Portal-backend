// scrapers/indeedScraper.js
const puppeteer = require('puppeteer');
const Listing = require('../models/Listing');

const scrapeIndeed = async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // change if your Chrome is elsewhere
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        );

        await page.goto('https://za.indeed.com/jobs?q=internship&l=South+Africa', { waitUntil: 'networkidle2' });

        const listings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.result'));
            return rows.map(el => {
                const titleEl = el.querySelector('h2.jobTitle span');
                const linkEl = el.querySelector('h2.jobTitle a');
                const companyEl = el.querySelector('.companyName');
                const locationEl = el.querySelector('.companyLocation');
                if (!titleEl || !linkEl) return null;
                const link = linkEl.href.startsWith('http') ? linkEl.href : `https://za.indeed.com${linkEl.href}`;
                return {
                    title: titleEl.innerText.trim(),
                    link,
                    company: companyEl ? companyEl.innerText.trim() : 'N/A',
                    location: locationEl ? locationEl.innerText.trim() : 'N/A',
                    type: 'internship',
                    source: 'Indeed'
                };
            }).filter(x => x !== null);
        });

        for (const item of listings) {
            const exists = await Listing.findOne({ link: item.link });
            if (!exists) await Listing.create(item);
        }

        console.log(`🎯 Indeed scraper finished. New listings: ${listings.length}`);
    } catch (err) {
        console.error('❌ Indeed scraper error:', err.message);
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = scrapeIndeed;

