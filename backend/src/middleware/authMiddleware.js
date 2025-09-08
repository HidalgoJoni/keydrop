const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware para rutas de Express (API REST)
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, token fallido' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

// Middleware para conexiones de Socket.IO
const protectSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: Token no proporcionado'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new Error('Authentication error: Usuario no encontrado'));
    }
    socket.user = user; // Adjuntamos el usuario al objeto del socket
    next();
  } catch (error) {
    return next(new Error('Authentication error: Token inválido'));
  }
};

module.exports = { protect, protectSocket };