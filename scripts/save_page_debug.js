const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/save_page_debug.js <url>');
  process.exit(1);
}

(async () => {
  const outDir = path.resolve(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const slug = url.replace(/https?:\/\//, '').replace(/[\/\?#=&]/g, '_');
  const htmlPath = path.join(outDir, `${slug}.rendered.html`);
  const imgPath = path.join(outDir, `${slug}.png`);

  console.log('Launching browser');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/135 Safari/537.36');
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    console.log('Opening', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));
    const html = await page.content();
    fs.writeFileSync(htmlPath, html, 'utf8');
    await page.screenshot({ path: imgPath, fullPage: true });
    console.log('Saved HTML to', htmlPath);
    console.log('Saved screenshot to', imgPath);
  } catch (err) {
    console.error('Error rendering page:', err.message);
  } finally {
    await browser.close();
  }
})();
