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

// basic rate limiter (configurable)
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 200;
// Set RATE_LIMIT_ENABLED=false to disable rate limiting (useful for local dev/testing)
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: RATE_LIMIT_MAX });

// Log effective rate limit settings at startup for debugging
console.log(`RATE_LIMIT_ENABLED=${RATE_LIMIT_ENABLED}, RATE_LIMIT_MAX=${RATE_LIMIT_MAX}`);

if (RATE_LIMIT_ENABLED) {
	app.use(limiter);
} else {
	console.log(`Rate limiter disabled (NODE_ENV=${process.env.NODE_ENV || 'development'}). Set RATE_LIMIT_ENABLED=true or set RATE_LIMIT_MAX to enable.`);
}

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