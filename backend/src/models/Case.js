// src/models/Case.js
const mongoose = require('mongoose');

const CaseSkinSchema = new mongoose.Schema({
  skinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin' },
  dropChance: { type: Number, default: 0 }
});

const CaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  possibleSkins: [CaseSkinSchema]
});

module.exports = mongoose.model('Case', CaseSchema);
