const User = require('../models/userModel');
const Case = require('../models/caseModel');
const Transaction = require('../models/transactionModel');
const { getWinningSkin } = require('../services/caseService');
const mongoose = require('mongoose');

exports.getAllCases = async (req, res) => {
    const cases = await Case.find({});
    res.json(cases);
};

exports.openCase = async (req, res) => {
    const { caseId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.user.id).session(session);
        const caseToOpen = await Case.findById(caseId).populate('possibleSkins.skin').session(session);

        if (user.balance < caseToOpen.price) {
            throw new Error('Saldo insuficiente');
        }

        user.balance -= caseToOpen.price;
        const wonSkin = getWinningSkin(caseToOpen.possibleSkins);
        user.inventory.push({ skin: wonSkin._id });
        
        await Transaction.create([{
            user: user._id,
            type: 'buyCase',
            amount: -caseToOpen.price,
            details: { caseId: caseToOpen._id, caseName: caseToOpen.name, wonSkinId: wonSkin._id },
            balanceAfter: user.balance,
        }], { session });

        await user.save({ session });
        await session.commitTransaction();

        res.json({ wonSkin });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};