const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Faltan campos' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'El correo ya está en uso' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hash, balance: 0, inventory: [], history: [] });
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Faltan campos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const user = await User.findById(userId).populate('inventory.skinId');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ user: {
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      inventory: user.inventory,
      history: user.history,
      createdAt: user.createdAt
    } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};