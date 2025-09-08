const mongoose = require('mongoose');

const skinSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    weaponType: { 
        type: String, 
        required: true 
    },
    rarity: {
        type: String,
        required: true,
        enum: [
            'Consumer', 
            'Industrial', 
            'Mil-Spec', 
            'Restricted', 
            'Classified', 
            'Covert', 
            'Contraband', 
            'Knife/Gloves'
        ],
        index: true
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    value: { 
        type: Number, 
        required: true 
    }
});

module.exports = mongoose.model('Skin', skinSchema);