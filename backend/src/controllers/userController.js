const User = require('../models/User');
const Skin = require('../models/Skin');
const Transaction = require('../models/Transaction');

exports.getInventory = async (req, res) => {
    const user = await User.findById(req.user.id).populate('inventory.skin');
    res.json(user.inventory);
};

exports.sellSkin = async (req, res) => {
    const { inventoryItemId } = req.body; // Este es el _id del objeto en el array de inventario
    const user = await User.findById(req.user.id);

    const itemToSell = user.inventory.id(inventoryItemId);
    if (!itemToSell) {
        return res.status(404).json({ message: 'Skin no encontrada en el inventario' });
    }

    const skinInfo = await Skin.findById(itemToSell.skin);
    user.balance += skinInfo.value;
    
    // El método .pull() de Mongoose elimina el subdocumento del array
    user.inventory.pull(inventoryItemId);

    await Transaction.create({
        user: user._id,
        type: 'sellSkin',
        amount: skinInfo.value,
        details: { skinId: skinInfo._id, skinName: skinInfo.name },
        balanceAfter: user.balance
    });

    await user.save();
    res.json({ newBalance: user.balance, soldSkinId: inventoryItemId });
};

exports.me = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findById(userId).populate('inventory.skinId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // remove sensitive fields
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      inventory: user.inventory,
      history: user.history,
      createdAt: user.createdAt
    };
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};