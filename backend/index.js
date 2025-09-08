require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./src/config/db');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const { setupBattleSocket } = require('./src/sockets/battleSocket');

// middleware
app.use(cors());
app.use(express.json());

// basic rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// connect db
connectDB();

// routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/cases', require('./src/routes/cases'));
app.use('/api/skins', require('./src/routes/skins'));
app.use('/api/market', require('./src/routes/market'));
app.use('/api/transactions', require('./src/routes/transactions'));
app.use('/api/battles', require('./src/routes/battles'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/leaderboard', require('./src/routes/leaderboard'));

// static or simple root
app.get('/', (req, res) => res.send({ ok: true, service: 'cs2-box-clone backend' }));

// sockets
setupBattleSocket(server);

// global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));