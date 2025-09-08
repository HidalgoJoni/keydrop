// src/controllers/battleController.js
const Battle = require('../models/Battle');
const User = require('../models/User');

exports.createBattle = async (req, res) => {
  try {
    const { caseId } = req.body;
    const battle = new Battle({ caseId });
    await battle.save();
    res.json({ battle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listBattles = async (req, res) => {
  try {
    const battles = await Battle.find({}).sort({ createdAt: -1 }).limit(50).populate('participants.userId');
    res.json({ battles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinBattle = async (req, res) => {
  try {
    const { battleId } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const battle = await Battle.findById(battleId);
    if (!battle) return res.status(404).json({ message: 'Battle not found' });

    if (battle.participants.some(p => String(p.userId) === String(userId))) return res.status(400).json({ message: 'Already joined' });

    battle.participants.push({ userId: user._id, username: user.username, isBot: false });
    await battle.save();

    res.json({ battle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
