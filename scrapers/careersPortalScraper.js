// scrapers/careersPortalScraper.js
const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const Listing = require("../models/Listing");

// Helper to save only-new items by unique link
async function saveListings(items) {
  for (const item of items) {
    try {
      const exists = await Listing.findOne({ link: item.link });
      if (!exists) await Listing.create(item);
    } catch (e) {
      console.error("Save error (CareersPortal):", e.message);
    }
  }
}

async function scrapeCategory(page, url, type) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // CareersPortal uses Drupal; list items sit in .views-row
  const rows = await page.$$eval(".views-row", (els) =>
    els
      .map((el) => {
        const a = el.querySelector(".title a, h2 a");
        const companyEl = el.querySelector(".field-name-field-company");
        const locationEl = el.querySelector(".field-name-field-location");
        if (!a) return null;

        const href = a.getAttribute("href") || "";
        const link = href.startsWith("http")
          ? href
          : `https://www.careersportal.co.za${href}`;

        return {
          title: (a.textContent || "").trim(),
          link,
          company: companyEl ? companyEl.textContent.trim() : "N/A",
          location: locationEl ? locationEl.textContent.trim() : "N/A",
          type,
          source: "CareersPortal",
        };
      })
      .filter(Boolean)
  );

  return rows;
}

const scrapeCareersPortal = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const base = "https://www.careersportal.co.za";
    const tasks = [
      { url: `${base}/learnerships`, type: "learnership" },
      { url: `${base}/internships`, type: "internship" },
      { url: `${base}/bursaries`, type: "bursary" },
    ];

    let total = 0;
    for (const t of tasks) {
      try {
        const items = await scrapeCategory(page, t.url, t.type);
        total += items.length;
        await saveListings(items);
        console.log(`CareersPortal ${t.type}: found ${items.length}`);
      } catch (e) {
        console.error(`CareersPortal ${t.type} error:`, e.message);
      }
    }

    console.log(`🎯 CareersPortal done. Total collected: ${total}`);
  } catch (err) {
    console.error("❌ CareersPortal scraper error:", err.message);
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = scrapeCareersPortal;
