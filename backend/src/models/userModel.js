const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        index: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    balance: { 
        type: Number, 
        default: 1000.0 
    },
    inventory: [{
        skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin' },
        obtainedAt: { type: Date, default: Date.now }
    }],
    history: [{
        action: { type: String, required: true },
        details: { type: mongoose.Schema.Types.Mixed },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

module.exports = mongoose.model('User', userSchema);