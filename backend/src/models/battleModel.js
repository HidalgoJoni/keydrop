const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
    case: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Case', 
        required: true 
    },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        bot: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot' },
        openedSkins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skin' }],
        totalValue: { type: Number, default: 0 }
    }],
    status: {
        type: String,
        enum: ['pending', 'ongoing', 'finished', 'cancelled'],
        default: 'pending'
    },
    winner: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'participants.user'
    },
    joinCode: { 
        type: String, 
        unique: true, 
        sparse: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);