require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Skin = require('../../src/models/Skin');
const Case = require('../../src/models/Case');
const User = require('../../src/models/User');

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

  // Additional high-value example skins (placeholders)
  // Replace imageUrl and values with real data from key-drop.com / Steam / csgostash
  const premiumSkins = await Skin.insertMany([
    { name: 'Dragon Lore', weaponType: 'AWP', rarity: 'covert', imageUrl: '', value: 15000 },
    { name: 'Medusa', weaponType: 'AWP', rarity: 'covert', imageUrl: '', value: 12000 },
    { name: 'Howl', weaponType: 'M4A4', rarity: 'covert', imageUrl: '', value: 8000 },
    { name: 'Karambit Fade', weaponType: 'Knife', rarity: 'knife/gloves', imageUrl: '', value: 10000 },
    { name: 'Gamma Doppler', weaponType: 'M9 Bayonet', rarity: 'knife/gloves', imageUrl: '', value: 6000 }
  ]);

  const csCase = new Case({ name: 'Starter Case', price: 100, possibleSkins: [
    { skinId: skins[0]._id, dropChance: 60 },
    { skinId: skins[1]._id, dropChance: 30 },
    { skinId: skins[2]._id, dropChance: 1 },
    { skinId: skins[3]._id, dropChance: 9 }
  ]});
  await csCase.save();

  // Example high-value cases (placeholders)
  // Replace these with the actual most-expensive cases from key-drop.com and add imageUrl values
  const premiumCaseA = new Case({
    name: 'Premium Case A',
    price: 2000,
    possibleSkins: [
      { skinId: premiumSkins[0]._id, dropChance: 1 },
      { skinId: premiumSkins[1]._id, dropChance: 1 },
      { skinId: premiumSkins[2]._id, dropChance: 2 },
      { skinId: premiumSkins[3]._id, dropChance: 1 },
      { skinId: premiumSkins[4]._id, dropChance: 5 }
    ],
    // imageUrl can point to an online preview or local asset
    imageUrl: ''
  });
  await premiumCaseA.save();

  const premiumCaseB = new Case({
    name: 'Premium Case B',
    price: 3500,
    possibleSkins: [
      { skinId: premiumSkins[1]._id, dropChance: 1 },
      { skinId: premiumSkins[2]._id, dropChance: 1 },
      { skinId: premiumSkins[3]._id, dropChance: 1 },
      { skinId: premiumSkins[4]._id, dropChance: 2 }
    ],
    imageUrl: ''
  });
  await premiumCaseB.save();

  const passwordHash = await bcrypt.hash('password', 10);
  const user = new User({ username: 'test', email: 'test@example.com', passwordHash: passwordHash, balance: 1000 });
  await user.save();

  console.log('Seeding complete');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
