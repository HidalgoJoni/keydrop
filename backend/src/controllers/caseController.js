const Case = require('../models/Case');
const Skin = require('../models/Skin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper to pick a skin based on drop chances
function pickSkinByChance(possibleSkins) {
  const total = possibleSkins.reduce((sum, p) => sum + (p.dropChance || 0), 0);
  let rand = Math.random() * total;
  for (let p of possibleSkins) {
    rand -= (p.dropChance || 0);
    if (rand <= 0) return p.skinId;
  }
  return possibleSkins.length ? possibleSkins[0].skinId : null;
}

exports.listCases = async (req, res) => {
  try {
    const cases = await Case.find({}).populate('possibleSkins.skinId');
    res.json({ cases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.openCase = async (req, res) => {
  try {
    const { caseId } = req.body;
    const userId = req.userId; // from auth middleware, optional

    const cs = await Case.findById(caseId).populate('possibleSkins.skinId');
    if (!cs) return res.status(404).json({ message: 'Case not found' });

    if (!userId) {
      // Allow opening without user for testing — but in production require auth
      const droppedSkinId = pickSkinByChance(cs.possibleSkins);
      const skin = await Skin.findById(droppedSkinId);
      return res.json({ wonSkin: skin });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.balance < cs.price) return res.status(400).json({ message: 'Insufficient balance' });

    // deduct balance
    user.balance -= cs.price;

    const droppedSkinId = pickSkinByChance(cs.possibleSkins);
    const skin = await Skin.findById(droppedSkinId);

    // add to inventory
    user.inventory.push({ skinId: skin._id });
    user.history.push({ action: 'buyCase', details: { caseId: cs._id, skinId: skin._id } });
    await user.save();

    // record transaction
    await Transaction.create({ userId: user._id, type: 'buyCase', details: { caseId: cs._id, skinId: skin._id }, amount: -cs.price });

    res.json({ wonSkin: skin, newBalance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};