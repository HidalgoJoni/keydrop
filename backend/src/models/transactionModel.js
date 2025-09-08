const mongoose =require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: {
        type: String,
        required: true,
        enum: ['buyCase', 'sellSkin', 'upgradeWin', 'upgradeLoss', 'battleWin', 'marketSale', 'marketPurchase', 'manualCredit']
    },
    // Almacena datos relevantes, como el ID del skin o la caja
    details: { 
        type: mongoose.Schema.Types.Mixed 
    },
    // Puede ser positivo (ganancia) o negativo (gasto)
    amount: { 
        type: Number, 
        required: true 
    },
    // El saldo del usuario después de la transacción
    balanceAfter: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);