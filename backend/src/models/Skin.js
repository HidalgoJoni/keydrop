// src/models/Skin.js
const mongoose = require('mongoose');

const SkinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weaponType: { type: String },
  rarity: { type: String, enum: ['consumer','industrial','milspec','restricted','classified','covert','contraband','knife/gloves'], default: 'consumer' },
  imageUrl: { type: String },
  value: { type: Number, default: 1 }
});

module.exports = mongoose.model('Skin', SkinSchema);
