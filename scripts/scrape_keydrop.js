#!/usr/bin/env node
/**
 * Simple scraper for key-drop category pages.
 * - Run locally (may be blocked by the site).
 * - Heuristically searches for percentage values and nearby text for item names.
 * - Saves per-page JSON into scripts/output/ and a merged output.json.
 *
 * Usage:
 *   cd /d "D:\Cosas Clase\keydrop"
 *   npm install axios cheerio mkdirp
 *   node scripts/scrape_keydrop.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const urls = [
  'https://key-drop.com/es/skins/category/flame-joker',
  'https://key-drop.com/es/skins/category/pandora',
  'https://key-drop.com/es/skins/category/sport',
  'https://key-drop.com/es/skins/category/emerald',
  'https://key-drop.com/es/skins/category/butterfly',
  'https://key-drop.com/es/skins/category/signal-joker',
  'https://key-drop.com/es/skins/category/elaine-joker',
  'https://key-drop.com/es/skins/category/alpha-joker',
  'https://key-drop.com/es/skins/category/knives-joker',
  'https://key-drop.com/es/skins/category/silk-joker'
];

const outDir = path.resolve(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function slugFromUrl(u) {
  return u.replace(/https?:\/\//, '').replace(/[\/\?#=&]/g, '_');
}

async function fetchPage(url) {
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': 'scraper-bot/1.0 (+local)' }, timeout: 20000 });
    return res.data;
  } catch (err) {
    console.error('Failed to GET', url, err.message);
    return null;
  }
}

// Heuristic extractor: find any text node that contains a percentage (e.g., '1%' or '0.5%')
// then try to find a nearby name: look for sibling elements with likely selectors, or fallback to text surrounding the percent.
function extractItems(html) {
  const $ = cheerio.load(html);
  const found = [];

  // scan for text containing '%'
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    const pctMatches = text.match(/(\d+(?:[.,]\d+)?)\s*%/g);
    if (pctMatches) {
      pctMatches.forEach((m) => {
        const pct = m.replace(',', '.').replace('%', '').trim();
        // try to get a nearby name: check previous siblings or parent headings
        let name = null;
        let imageUrl = null;
        // look for a sibling with a likely name or image
        const parent = $(el).parent();
        const candidates = parent.find('a, .name, .title, h3, h4, .skin-name, img[alt]');
        if (candidates && candidates.length > 0) {
          const first = $(candidates[0]);
          name = first.text().trim() || first.attr('alt') || null;
          // if there's an img descendant, take its src/data-src
          const img = first.find('img').first();
          if (img && img.attr('src')) imageUrl = img.attr('src');
        }

        // try to find an img near the element
        if (!imageUrl) {
          const nearbyImg = parent.find('img').first();
          if (nearbyImg && (nearbyImg.attr('data-src') || nearbyImg.attr('src'))) {
            imageUrl = nearbyImg.attr('data-src') || nearbyImg.attr('src');
          }
        }

        // fallback: previous text node
        if (!name) {
          const prev = $(el).prev();
          if (prev && prev.text()) name = prev.text().trim();
        }

        // fallback: parent text without percent
        if (!name) {
          const parentText = parent.text().replace(/\s+/g, ' ').trim();
          name = parentText.replace(m, '').trim();
        }

        // try meta og:image as a last resort
        if (!imageUrl) {
          const og = $('meta[property="og:image"]').attr('content');
          if (og) imageUrl = og;
        }

        // final cleanup: remove stray percentage or separators
        if (name) name = name.replace(/[:\n\r\t]+/g, ' ').trim();

        if (name && pct) {
          found.push({ name, chance: parseFloat(pct), imageUrl: imageUrl || null });
        }
      });
    }
  });

  // Deduplicate by name
  const dedup = [];
  const seen = new Set();
  for (const it of found) {
    const key = it.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      dedup.push(it);
    }
  }
  return dedup;
}

async function main() {
  const all = {};
  for (const url of urls) {
    console.log('Fetching', url);
    const html = await fetchPage(url);
    if (!html) continue;
    const items = extractItems(html);
    const slug = slugFromUrl(url);
    all[slug] = { url, items };
    fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify({ url, items }, null, 2));
    console.log('Saved', slug, 'items:', items.length);
    // be polite
    await new Promise(r => setTimeout(r, 1500));
  }
  fs.writeFileSync(path.join(outDir, 'all.json'), JSON.stringify(all, null, 2));
  console.log('Done. Outputs in', outDir);
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
