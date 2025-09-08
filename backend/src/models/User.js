// src/models/User.js
const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  skinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin' },
  obtainedAt: { type: Date, default: Date.now }
});

const HistoryItemSchema = new mongoose.Schema({
  action: String,
  details: mongoose.Mixed,
  date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  balance: { type: Number, default: 1000 },
  inventory: [InventoryItemSchema],
  history: [HistoryItemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
