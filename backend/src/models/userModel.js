const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        index: true // Indexar para búsquedas rápidas
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
    // Referencia a una instancia única de un skin, no solo al tipo de skin
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

// Método para comparar contraseñas durante el login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

module.exports = mongoose.model('User', userSchema);