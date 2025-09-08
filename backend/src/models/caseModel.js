const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    possibleSkins: [{
        skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin' },
        // La probabilidad de obtener este skin (ej: 0.8 para 80%)
        dropChance: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Case', caseSchema);