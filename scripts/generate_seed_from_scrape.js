const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, 'output');
const allPath = path.join(outDir, 'all.json');
if (!fs.existsSync(allPath)) {
  console.error('Missing', allPath, 'run scrape_keydrop.js first');
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(allPath, 'utf8'));
const imagesMapPath = path.join(outDir, 'images_map.json');
const imagesMap = fs.existsSync(imagesMapPath) ? JSON.parse(fs.readFileSync(imagesMapPath, 'utf8')) : {};

const skins = [];
const cases = [];

// convert each page into a case with skins
for (const key of Object.keys(all)) {
  const page = all[key];
  const caseName = page.url.split('/').pop() || key;
  const items = page.items || [];
  const caseSkins = items.map((it, idx) => {
    const id = `S${skins.length + idx + 1}`;
  const imageUrl = it.imageUrl && imagesMap[it.imageUrl] ? imagesMap[it.imageUrl] : (it.imageUrl || '');
  skins.push({ id, name: it.name, imageUrl: imageUrl, value: Math.round((it.chance && it.chance < 100) ? (1000 / (it.chance || 1)) : 100) });
    return { skinRef: id, chance: it.chance || 0 };
  });
  cases.push({ name: caseName, price: 100, skins: caseSkins });
}

// build seed file content
const seedPath = path.resolve(__dirname, '..', 'database', 'seeds', 'initialSeed_generated.js');
let content = `// Generated seed from scraped data\nrequire('dotenv').config();\nconst mongoose = require('mongoose');\nconst bcrypt = require('bcryptjs');\nconst Skin = require('../../src/models/Skin');\nconst Case = require('../../src/models/Case');\nconst User = require('../../src/models/User');\n\nconst MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cs2-box-clone';\n\nasync function run() {\n  await mongoose.connect(MONGODB_URI);\n  console.log('Connected to DB for generated seeding');\n\n  await Skin.deleteMany({});\n  await Case.deleteMany({});\n  await User.deleteMany({});\n\n`;

// add skins
content += `  const skins = await Skin.insertMany([\n`;
for (const s of skins) {
  content += `    { name: ${JSON.stringify(s.name)}, weaponType: 'Unknown', rarity: 'unknown', imageUrl: ${JSON.stringify(s.imageUrl)}, value: ${s.value} },\n`;
}
content += `  ]);\n\n`;

// add cases
content += `  // create cases\n`;
for (const c of cases) {
  content += `  const _c_${c.name.replace(/[^a-z0-9]/gi, '_')} = new Case({ name: ${JSON.stringify(c.name)}, price: ${c.price}, possibleSkins: [\n`;
  for (const sk of c.skins) {
    // map skinRef to array index after insertMany: rough mapping by insertion order
    content += `    // skinRef ${sk.skinRef} with chance ${sk.chance}\n`;
  }
  content += `  ]});\n  await _c_${c.name.replace(/[^a-z0-9]/gi, '_')}.save();\n\n`;
}

content += `  const passwordHash = await bcrypt.hash('password', 10);\n  const user = new User({ username: 'test', email: 'test@example.com', passwordHash: passwordHash, balance: 1000 });\n  await user.save();\n\n  console.log('Generated seeding complete');\n  process.exit(0);\n}\n\nrun().catch(err => { console.error(err); process.exit(1); });\n`;

fs.writeFileSync(seedPath, content, 'utf8');
console.log('Wrote', seedPath);
