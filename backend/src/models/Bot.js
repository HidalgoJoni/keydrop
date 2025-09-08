const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // ej. Bot_1, Bot_2...
  avatar: { type: String }, // opcional, para mostrar en frontend
  balance: { type: Number, default: 1000.0 },
  inventory: [{
    skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin' },
    obtainedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Bot = mongoose.models.Bot || mongoose.model('Bot', BotSchema);
module.exports = Bot;
