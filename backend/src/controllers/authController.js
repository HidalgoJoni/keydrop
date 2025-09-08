const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
        username,
        email,
        passwordHash: password, // El hash se hace en el pre-save del modelo
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
};

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Email o contraseña inválidos' });
    }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
    // req.user es añadido por el middleware 'protect'
    res.json(req.user);
};

module.exports = { registerUser, loginUser, getUserProfile };