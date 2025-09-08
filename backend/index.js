// backend/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const connectDB = require('./src/config/db');
const cors = require('cors');

// Conectar a la base de datos
connectDB();

const app = express();
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Middleware para parsear JSON

// Rutas de la API
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/cases', require('./src/routes/caseRoutes'));
// ... más rutas ...

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // La URL de tu frontend
        methods: ["GET", "POST"]
    }
});

// Lógica de WebSockets para batallas
const battleHandler = require('./src/sockets/battleHandler');
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    battleHandler(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));