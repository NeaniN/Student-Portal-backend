// scrapers/careersPortalScraper.js
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const Listing = require('../models/Listing');

const scrapeCareersPortal = async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(), // ✅ Works on Render
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        );

        await page.goto('https://www.careersportal.co.za/learnerships', { waitUntil: 'networkidle2' });

        const listings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.views-row'));
            return rows.map(el => {
                const titleEl = el.querySelector('.title a');
                const companyEl = el.querySelector('.field-name-field-company');
                const locationEl = el.querySelector('.field-name-field-location');
                if (!titleEl) return null;
                return {
                    title: titleEl.innerText.trim(),
                    link: titleEl.href.startsWith('http') ? titleEl.href : `https://www.careersportal.co.za${titleEl.getAttribute('href')}`,
                    company: companyEl ? companyEl.innerText.trim() : 'N/A',
                    location: locationEl ? locationEl.innerText.trim() : 'N/A',
                    type: 'learnership',
                    source: 'CareersPortal'
                };
            }).filter(x => x !== null);
        });

        for (const item of listings) {
            const exists = await Listing.findOne({ link: item.link });
            if (!exists) await Listing.create(item);
        }

        console.log(`🎯 Careers Portal scraper finished. New listings: ${listings.length}`);
    } catch (err) {
        console.error('❌ Careers Portal scraper error:', err.message);
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = scrapeCareersPortal;
