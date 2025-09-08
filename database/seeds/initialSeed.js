// database/seeds/initialSeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Skin = require('../../backend/src/models/Skin');
const Case = require('../../backend/src/models/Case');
const User = require('../../backend/src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cs2-box-clone';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB for seeding');

  await Skin.deleteMany({});
  await Case.deleteMany({});
  await User.deleteMany({});

  const skins = await Skin.insertMany([
    { name: 'Blue Laminate', weaponType: 'AK-47', rarity: 'restricted', imageUrl: '', value: 50 },
    { name: 'Redline', weaponType: 'AK-47', rarity: 'classified', imageUrl: '', value: 300 },
    { name: 'Fade Knife', weaponType: 'Knife', rarity: 'knife/gloves', imageUrl: '', value: 2000 },
    { name: 'P250 Sand Dune', weaponType: 'P250', rarity: 'consumer', imageUrl: '', value: 5 }
  ]);

  const csCase = new Case({ name: 'Starter Case', price: 100, possibleSkins: [
    { skinId: skins[0]._id, dropChance: 60 },
    { skinId: skins[1]._id, dropChance: 30 },
    { skinId: skins[2]._id, dropChance: 1 },
    { skinId: skins[3]._id, dropChance: 9 }
  ]});
  await csCase.save();

  const passwordHash = await bcrypt.hash('password', 10);
  const user = new User({ username: 'test', email: 'test@example.com', passwordHash, balance: 1000 });
  await user.save();

  console.log('Seeding complete');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
