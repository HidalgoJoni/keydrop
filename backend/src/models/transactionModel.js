const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: {
        type: String,
        required: true,
        enum: ['buyCase', 'sellSkin', 'upgradeWin', 'upgradeLoss', 'battleWin', 'manualCredit']
    },
    details: { 
        type: mongoose.Schema.Types.Mixed 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    balanceAfter: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);