const User = require('../models/userModel');
const Skin = require('../models/skinModel');
const Transaction = require('../models/transactionModel');

exports.attemptUpgrade = async (req, res) => {
    const { inventoryItemId, targetSkinId } = req.body;
    const user = await User.findById(req.user.id);

    const itemToUpgrade = user.inventory.id(inventoryItemId);
    if (!itemToUpgrade) {
        return res.status(404).json({ message: 'Skin a sacrificar no encontrada' });
    }
    
    const [sacrificedSkin, targetSkin] = await Promise.all([
        Skin.findById(itemToUpgrade.skin),
        Skin.findById(targetSkinId)
    ]);

    if (!targetSkin || sacrificedSkin.value >= targetSkin.value) {
        return res.status(400).json({ message: 'Upgrade inválido' });
    }

    // Lógica de probabilidad: (valor base / valor objetivo) * multiplicador (ej. 0.75)
    const successChance = Math.min((sacrificedSkin.value / targetSkin.value) * 0.75, 0.9); // Capado al 90%
    const isSuccess = Math.random() < successChance;

    // Siempre se elimina la skin sacrificada
    user.inventory.pull(inventoryItemId);

    if (isSuccess) {
        user.inventory.push({ skin: targetSkin._id });
        await Transaction.create({
            user: user._id, type: 'upgradeWin', amount: 0,
            details: { from: sacrificedSkin.name, to: targetSkin.name },
            balanceAfter: user.balance
        });
        await user.save();
        res.json({ success: true, wonSkin: targetSkin, chance: successChance });
    } else {
        await Transaction.create({
            user: user._id, type: 'upgradeLoss', amount: 0,
            details: { from: sacrificedSkin.name, to: targetSkin.name },
            balanceAfter: user.balance
        });
        await user.save();
        res.json({ success: false, message: 'Upgrade fallido', chance: successChance });
    }
};