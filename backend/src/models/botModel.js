const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    avatar: { 
        type: String, 
        default: 'default_bot_avatar.jpg' 
    },
    // Define cómo se comporta un bot, por ejemplo, qué cajas prefiere
    behaviorProfile: {
        type: String,
        enum: ['agresivo', 'conservador', 'aleatorio'],
        default: 'aleatorio'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Bot', botSchema);