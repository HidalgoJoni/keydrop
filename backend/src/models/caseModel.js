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
        dropChance: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Case', caseSchema);