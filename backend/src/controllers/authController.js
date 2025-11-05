const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validar entrada
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Se requiere nombre de usuario, correo electrónico y contraseña' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = new User({ username, email, passwordHash, balance: 0, inventory: [], history: [] });
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance } });
  } catch (err) {
    next(err);
  }
};

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Se requiere correo electrónico y contraseña' });
    }

    // Buscar usuario e incluir contraseña
    const user = await User.findOne({ email }).select('+password');

    // Asegurarse de que el usuario y el hash de la contraseña existan
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Asegurarse de que ambos argumentos para bcrypt.compare sean cadenas
    const storedHash = typeof user.password === 'string' ? user.password : String(user.password);
    const candidate = typeof password === 'string' ? password : String(password);

    const match = await bcrypt.compare(candidate, storedHash);
    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance } });
  } catch (err) {
    next(err);
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