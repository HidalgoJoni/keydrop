const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

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

function slugFromUrl(u) { return u.replace(/https?:\/\//, '').replace(/[\/\?#=&]/g, '_'); }

function extractItems(html) {
  const $ = cheerio.load(html);
  const found = [];
  $('*').each((i, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    const pctMatches = text.match(/(\d+(?:[.,]\d+)?)\s*%/g);
    if (pctMatches) {
      pctMatches.forEach((m) => {
        const pct = m.replace(',', '.').replace('%', '').trim();
        let name = null;
        let imageUrl = null;
        const parent = $(el).parent();
        const candidates = parent.find('a, .name, .title, h3, h4, .skin-name, img[alt]');
        if (candidates && candidates.length > 0) {
          const first = $(candidates[0]);
          name = first.text().trim() || first.attr('alt') || null;
          const img = first.find('img').first();
          if (img && img.attr('src')) imageUrl = img.attr('src');
        }
        if (!imageUrl) {
          const nearbyImg = parent.find('img').first();
          if (nearbyImg && (nearbyImg.attr('data-src') || nearbyImg.attr('src'))) {
            imageUrl = nearbyImg.attr('data-src') || nearbyImg.attr('src');
          }
        }
        if (!name) {
          const prev = $(el).prev();
          if (prev && prev.text()) name = prev.text().trim();
        }
        if (!name) {
          const parentText = parent.text().replace(/\s+/g, ' ').trim();
          name = parentText.replace(m, '').trim();
        }
        if (!imageUrl) {
          const og = $('meta[property="og:image"]').attr('content');
          if (og) imageUrl = og;
        }
        if (name) name = name.replace(/[:\n\r\t]+/g, ' ').trim();
        if (name && pct) found.push({ name, chance: parseFloat(pct), imageUrl: imageUrl || null });
      });
    }
  });
  // dedupe
  const dedup = [];
  const seen = new Set();
  for (const it of found) {
    const key = it.name.toLowerCase();
    if (!seen.has(key)) { seen.add(key); dedup.push(it); }
  }
  return dedup;
}

(async () => {
  console.log('Launching headless browser (Puppeteer)');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135 Safari/537.36');
  const all = {};
  for (const url of urls) {
    try {
      console.log('Loading', url);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('HTML snippet:', html.slice(0, 300).replace(/\s+/g, ' '));
  const items = extractItems(html);
      const slug = slugFromUrl(url);
      all[slug] = { url, items };
      fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify({ url, items }, null, 2));
      console.log('Saved', slug, 'items:', items.length);
  // page.waitForTimeout may not exist in older puppeteer versions; use a Promise sleep
  await new Promise(r => setTimeout(r, 1200));
    } catch (err) {
      console.error('Failed', url, err.message);
    }
  }
  fs.writeFileSync(path.join(outDir, 'all.json'), JSON.stringify(all, null, 2));
  await browser.close();
  console.log('Done. Outputs in', outDir);
})();
