#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const outDir = path.resolve(__dirname, 'output');
const allPath = path.join(outDir, 'all.json');
if (!fs.existsSync(allPath)) {
  console.error('Missing', allPath, 'run scrape_keydrop.js first');
  process.exit(1);
}

const imagesDir = path.resolve(__dirname, '..', 'public', 'images', 'skins');
fs.mkdirSync(imagesDir, { recursive: true });

const all = JSON.parse(fs.readFileSync(allPath, 'utf8'));
const map = {};

function safeFilename(name, url) {
  const ext = path.extname(url.split('?')[0]) || '.jpg';
  const safe = name.replace(/[^a-z0-9.-]/gi, '_').slice(0, 80);
  return `${safe}${ext}`;
}

async function download(url, dest) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'image-downloader/1.0' } });
    fs.writeFileSync(dest, res.data);
    return true;
  } catch (err) {
    console.warn('Failed download', url, err.message);
    return false;
  }
}

(async () => {
  for (const key of Object.keys(all)) {
    const page = all[key];
    const items = page.items || [];
    for (const it of items) {
      if (!it.imageUrl) continue;
      const url = it.imageUrl;
      // avoid data: or relative links
      if (!/^https?:\/\//i.test(url)) continue;
      const filename = safeFilename(it.name || key, url);
      const destPath = path.join(imagesDir, filename);
      if (fs.existsSync(destPath)) {
        map[url] = `/images/skins/${filename}`;
        continue;
      }
      const ok = await download(url, destPath);
      if (ok) map[url] = `/images/skins/${filename}`;
      // be polite
      await new Promise(r => setTimeout(r, 500));
    }
  }
  fs.writeFileSync(path.join(outDir, 'images_map.json'), JSON.stringify(map, null, 2));
  console.log('Downloaded images, map written to', path.join(outDir, 'images_map.json'));
})();
