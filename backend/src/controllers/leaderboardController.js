// src/controllers/leaderboardController.js
const User = require('../models/User');
const Skin = require('../models/Skin');

exports.leaderboard = async (req, res) => {
  try {
    const users = await User.find({}).populate('inventory.skinId');
    const list = users.map(u => {
      const totalValue = u.inventory.reduce((s, it) => s + ((it.skinId && it.skinId.value) ? it.skinId.value : 0), 0);
      return { userId: u._id, username: u.username, totalValue };
    }).sort((a,b) => b.totalValue - a.totalValue).slice(0,50);
    res.json({ leaders: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
