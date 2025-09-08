const User = require('../models/userModel');
const Skin = require('../models/skinModel');
const Transaction = require('../models/transactionModel');

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