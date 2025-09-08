const User = require('../models/User');
const Skin = require('../models/Skin');
const Transaction = require('../models/Transaction');

const rarities = ['consumer','industrial','milspec','restricted','classified','covert','contraband','knife/gloves'];

exports.upgrade = async (req, res) => {
  try {
    const userId = req.userId;
    const { inventoryIndex } = req.body; // index of inventory item to upgrade
    const user = await User.findById(userId).populate('inventory.skinId');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = user.inventory[inventoryIndex];
    if (!item) return res.status(400).json({ message: 'Inventory item not found' });

    const currentSkin = await Skin.findById(item.skinId);
    const currentRarityIndex = rarities.indexOf(currentSkin.rarity);
    if (currentRarityIndex === -1 || currentRarityIndex === rarities.length - 1) {
      return res.status(400).json({ message: 'Cannot upgrade this skin' });
    }

    const cost = Math.ceil(currentSkin.value * 0.5);
    if (user.balance < cost) return res.status(400).json({ message: 'Insufficient balance' });

    // consume balance
    user.balance -= cost;

    // probability to upgrade (example: 30%)
    const success = Math.random() < 0.3;
    let newSkin = currentSkin;

    if (success) {
      // pick a skin with higher rarity (next rarity tier)
      const nextRarity = rarities[currentRarityIndex + 1];
      const candidates = await Skin.find({ rarity: nextRarity });
      if (candidates.length > 0) {
        newSkin = candidates[Math.floor(Math.random() * candidates.length)];
        // replace inventory item
        user.inventory[inventoryIndex].skinId = newSkin._id;
        user.history.push({ action: 'upgrade', details: { from: currentSkin._id, to: newSkin._id, success: true } });
      } else {
        // no candidate found: fail
        user.history.push({ action: 'upgrade', details: { from: currentSkin._id, success: false } });
      }
    } else {
      // failed upgrade
      user.history.push({ action: 'upgrade', details: { from: currentSkin._id, success: false } });
    }

    await user.save();
    await Transaction.create({ userId, type: 'upgrade', details: { inventoryIndex, success }, amount: -cost });

    res.json({ success, newSkin, newBalance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};