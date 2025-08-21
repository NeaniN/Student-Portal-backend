// scrapers/nsfasScraper.js
const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const Listing = require("../models/Listing");

async function saveListings(items) {
  for (const item of items) {
    try {
      const exists = await Listing.findOne({ link: item.link });
      if (!exists) await Listing.create(item);
    } catch (e) {
      console.error("Save error (NSFAS):", e.message);
    }
  }
}

const scrapeNSFAS = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();

    // Try bursaries & news pages that are public
    const targets = [
      { url: "https://www.nsfas.org.za/", type: "bursary" },
      { url: "https://www.nsfas.org.za/news", type: "bursary" },
    ];

    let total = 0;

    for (const t of targets) {
      try {
        await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });

        const items = await page.evaluate((type) => {
          const results = [];
          // very generic selectors to avoid hard breaks
          const links = Array.from(
            document.querySelectorAll("a[href*='bursar'], a[href*='fund'], a[href*='news'], a[href*='opportun']")
          ).slice(0, 30);
          links.forEach((a) => {
            const title = (a.textContent || "").trim();
            const href = a.getAttribute("href") || "";
            if (!title || !href) return;
            const link = href.startsWith("http") ? href : new URL(href, location.origin).href;
            results.push({
              title,
              link,
              company: "NSFAS",
              location: "South Africa",
              type,
              source: "NSFAS",
            });
          });
          return results;
        }, t.type);

        total += items.length;
        await saveListings(items);
        console.log(`NSFAS page ${t.url} -> ${items.length} items`);
      } catch (e) {
        console.error("NSFAS sub-step error:", e.message);
      }
    }

    console.log(`🎯 NSFAS done. Collected: ${total}`);
  } catch (err) {
    console.error("❌ NSFAS scraper error:", err.message);
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = scrapeNSFAS;
