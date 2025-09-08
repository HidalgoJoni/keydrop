// src/models/Market.js
const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active','sold','cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Market', MarketSchema);
