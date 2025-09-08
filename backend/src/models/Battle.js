// src/models/Battle.js
const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String,
  isBot: { type: Boolean, default: false },
  openedSkins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skin' }]
});

const BattleSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  participants: [ParticipantSchema],
  status: { type: String, enum: ['pending','ongoing','finished'], default: 'pending' },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Battle', BattleSchema);
