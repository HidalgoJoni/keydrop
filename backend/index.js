require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { protectSocket } = require('./src/middleware/authMiddleware'); // Middleware para sockets

// Conectar a la Base de Datos
connectDB();

const app = express();

// Middlewares de Express
app.use(cors()); // Permite peticiones desde otros dominios (tu frontend)
app.use(express.json()); // Permite al servidor aceptar y parsear JSON

// Rutas de la API
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/cases', require('./src/routes/caseRoutes'));
app.use('/api/upgrades', require('./src/routes/upgradeRoutes'));

// Configuración del servidor y Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // URL de tu frontend en desarrollo
    methods: ['GET', 'POST'],
  },
});

// Middleware de autenticación para Socket.IO
io.use(protectSocket);

// Manejador de eventos de Socket.IO
const battleHandler = require('./src/sockets/battleHandler');
io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado a sockets: ${socket.user.username} (${socket.id})`);
  battleHandler(io, socket);

  socket.on('disconnect', () => {
    console.log(`🔌 Usuario desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));