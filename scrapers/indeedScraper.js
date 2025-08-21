// scrapers/indeedScraper.js
const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const Listing = require("../models/Listing");

async function saveListings(items) {
  for (const item of items) {
    try {
      const exists = await Listing.findOne({ link: item.link });
      if (!exists) await Listing.create(item);
    } catch (e) {
      console.error("Save error (Indeed):", e.message);
    }
  }
}

const scrapeIndeed = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl =
      "https://za.indeed.com/jobs?q=internship&l=South+Africa";

    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Indeed changes CSS often; use broader selectors and normalize
    const items = await page.evaluate(() => {
      const out = [];
      const cards =
        document.querySelectorAll("[data-testid='result'], .result, .jobsearch-SerpJobCard") ||
        [];
      cards.forEach((el) => {
        const titleEl =
          el.querySelector("h2 a, a.jcs-JobTitle, a[aria-label]") ||
          el.querySelector("h2.jobTitle a");
        const companyEl =
          el.querySelector("[data-testid='company-name'], .companyName") || null;
        const locationEl =
          el.querySelector("[data-testid='text-location'], .companyLocation") ||
          null;

        if (!titleEl) return;
        const href = titleEl.getAttribute("href") || "";
        const link = href.startsWith("http")
          ? href
          : `https://za.indeed.com${href}`;

        out.push({
          title: (titleEl.textContent || "").trim(),
          link,
          company: companyEl ? companyEl.textContent.trim() : "N/A",
          location: locationEl ? locationEl.textContent.trim() : "N/A",
          type: "internship",
          source: "Indeed",
        });
      });
      return out;
    });

    await saveListings(items);
    console.log(`🎯 Indeed done. Collected: ${items.length}`);
  } catch (err) {
    console.error("❌ Indeed scraper error:", err.message);
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = scrapeIndeed;
