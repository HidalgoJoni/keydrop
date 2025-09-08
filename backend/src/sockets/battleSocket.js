// src/sockets/battleSocket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Battle = require('../models/Battle');
const CaseModel = require('../models/Case');
const Skin = require('../models/Skin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const BOT_COUNT = process.env.BOT_COUNT ? parseInt(process.env.BOT_COUNT,10) : 5;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// simple in-memory bot pool
const bots = [];
for (let i = 1; i <= BOT_COUNT; i++) bots.push({ id: `bot-${i}`, username: `Bot_${i}`, isBot: true });

// helper to pick skin by chance given populated possibleSkins
function pickSkinByChance(possibleSkins) {
  const total = possibleSkins.reduce((sum, p) => sum + (p.dropChance || 0), 0);
  let rand = Math.random() * total;
  for (let p of possibleSkins) {
    rand -= (p.dropChance || 0);
    if (rand <= 0) return p.skinId;
  }
  return possibleSkins.length ? possibleSkins[0].skinId : null;
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

function setupBattleSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
      }
      return next();
    } catch (err) {
      // don't block unauthenticated sockets; allow guests
      return next();
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id, 'userId=', socket.userId || 'guest');

    socket.on('create-battle', async ({ caseId }) => {
      try {
        const battle = new Battle({ caseId });
        await battle.save();
        socket.join(battle._id.toString());
        socket.emit('battle-created', { battle });
      } catch (err) {
        socket.emit('error', { message: 'Could not create battle' });
      }
    });

    socket.on('join-battle', async ({ battleId, username }) => {
      try {
        const battle = await Battle.findById(battleId);
        if (!battle) return socket.emit('error', { message: 'Battle not found' });

        let participant = null;
        if (socket.userId) {
          // authenticated user
          const user = await User.findById(socket.userId);
          if (user) participant = { userId: user._id, username: user.username, isBot: false };
        } else {
          participant = { userId: null, username: username || `Guest_${socket.id.slice(0,4)}`, isBot: true };
        }

        if (participant && !battle.participants.some(p => String(p.userId) === String(participant.userId) && !participant.isBot)) {
          battle.participants.push(participant);
          await battle.save();
        }

        socket.join(battleId);
        io.to(battleId).emit('player-list', { participants: battle.participants });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Could not join battle' });
      }
    });

    socket.on('start-battle', async ({ battleId, minPlayers = 2, maxPlayers = 6 }) => {
      try {
        const battle = await Battle.findById(battleId).populate('caseId');
        if (!battle) return socket.emit('error', { message: 'Battle not found' });

        while (battle.participants.length < minPlayers) {
          const bot = bots[Math.floor(Math.random() * bots.length)];
          battle.participants.push({ userId: null, username: bot.username, isBot: true });
        }

        battle.status = 'ongoing';
        await battle.save();

        io.to(battleId).emit('battle-started', { participants: battle.participants });

        const pop = await CaseModel.findById(battle.caseId._id).populate('possibleSkins.skinId');
        const results = [];

        for (let p of battle.participants) {
          let skinId = pickSkinByChance(pop.possibleSkins.map(ps => ({ skinId: ps.skinId._id, dropChance: ps.dropChance })));
          const skin = await Skin.findById(skinId);
          results.push({ participant: p, skin });
        }

        // emit several 'spin' frames to allow client animation
        const frames = 6;
        for (let f = 0; f < frames; f++) {
          // build items array: mixture of random skins
          const items = [];
          for (let i = 0; i < 30; i++) {
            const picked = pop.possibleSkins[Math.floor(Math.random() * pop.possibleSkins.length)].skinId;
            const skin = await Skin.findById(picked);
            items.push({ id: skin._id, name: skin.name, imageUrl: skin.imageUrl, value: skin.value });
          }
          // on final frame, ensure winner skin appears near center
          if (f === frames - 1) {
            // determine winner by highest value among results
            let winner = results[0];
            for (let r of results) {
              if ((r.skin?.value || 0) > (winner.skin?.value || 0)) winner = r;
            }
            // place winner skin in the middle
            const mid = Math.floor(items.length / 2);
            items[mid] = { id: winner.skin._id, name: winner.skin.name, imageUrl: winner.skin.imageUrl, value: winner.skin.value };
          }
          io.to(battleId).emit('battle-spin', { frame: f, items });
          await delay(600 + f * 200);
        }

        // now persist results and assign skins to users
        for (let r of results) {
          const p = r.participant;
          const skin = r.skin;
          if (!p.isBot && p.userId) {
            const user = await User.findById(p.userId);
            if (user) {
              user.inventory.push({ skinId: skin._id });
              user.history.push({ action: 'battle_open', details: { battleId: battle._id, skinId: skin._id } });
              await user.save();
              await Transaction.create({ userId: user._id, type: 'battle', details: { battleId: battle._id, skinId: skin._id }, amount: 0 });
            }
          }
        }

        let winner = results[0];
        for (let r of results) {
          if ((r.skin?.value || 0) > (winner.skin?.value || 0)) winner = r;
        }

        battle.status = 'finished';
        if (!winner.participant.isBot && winner.participant.userId) battle.winnerId = winner.participant.userId;
        await battle.save();

        io.to(battleId).emit('battle-result', { results, winner: winner.participant, winnerSkin: winner.skin });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Error starting battle' });
      }
    });

    socket.on('leave-battle', ({ battleId }) => {
      socket.leave(battleId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });

  console.log(`Battle socket ready (bot count ${BOT_COUNT})`);
}

module.exports = { setupBattleSocket };
