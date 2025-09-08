const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    balance: { type: Number, default: 1000 }, // Saldo inicial ficticio
    inventory: [{
        skin: { type: mongoose.Schema.Types.ObjectId, ref: 'Skin' },
        obtainedAt: { type: Date, default: Date.now }
    }],
    history: [{
        action: String, // ej: 'case_opening', 'sell_skin', 'upgrade_win', 'upgrade_loss'
        details: mongoose.Schema.Types.Mixed,
        date: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

module.exports = mongoose.model('User', userSchema);