// src/controllers/transactionController.js
const Transaction = require('../models/Transaction');

exports.listUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, page = 1, limit = 50 } = req.query;
    const filter = { userId };
    if (type) filter.type = type;
    const txs = await Transaction.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(parseInt(limit));
    res.json({ transactions: txs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
