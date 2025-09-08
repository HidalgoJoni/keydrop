const mongoose = require('mongoose');
const Battle = require('../models/battleModel');
const Case = require('../models/Case');
const User = require('../models/User');
const Bot = require('../models/Bot');
const Transaction = require('../models/Transaction');
const { getWinningSkin } = require('../services/caseService');

// Objeto en memoria para gestionar el estado de las batallas en curso
// La clave es el ID de la batalla, el valor es el estado de esa batalla.
const activeBattles = {};

// --- FUNCIÓN PRINCIPAL DE LA LÓGICA DE BATALLA ---
async function startBattle(io, battleId) {
    console.log(`[Battle] Iniciando batalla: ${battleId}`);
    const battleState = activeBattles[battleId];
    if (!battleState) return;

    try {
        // 1. Bloquear la batalla y actualizar su estado
        battleState.status = 'ongoing';
        await Battle.findByIdAndUpdate(battleId, { status: 'ongoing' });
        io.to(battleId).emit('battle:state:update', battleState); // Notificar a los clientes
        io.emit('battles:list:update', { updated: battleId, status: 'ongoing' }); // Actualizar lobby

        // 2. Rellenar con bots si es necesario
        const botsNeeded = battleState.maxPlayers - battleState.players.length;
        if (botsNeeded > 0) {
            const bots = await Bot.find({ isActive: true }).limit(botsNeeded);
            bots.forEach(bot => {
                battleState.players.push({
                    isBot: true,
                    botId: bot._id,
                    username: bot.name,
                    avatar: bot.avatar,
                });
            });
        }
        io.to(battleId).emit('battle:state:update', battleState);

        // 3. Obtener la información de la caja y sus skins
        const caseWithSkins = await Case.findById(battleState.caseId).populate('possibleSkins.skin');
        if (!caseWithSkins) throw new Error('No se pudo encontrar la información de la caja.');

        // 4. Simular la apertura de cajas para cada jugador
        const results = battleState.players.map(player => {
            const wonSkin = getWinningSkin(caseWithSkins.possibleSkins);
            player.wonSkin = wonSkin;
            player.totalValue = wonSkin.value; // Asumiendo 1 caja por batalla por ahora
            return {
                userId: player.userId,
                botId: player.botId,
                username: player.username,
                skin: wonSkin,
            };
        });

        io.to(battleId).emit('battle:results', results); // Enviar skins para la animación

        // 5. Esperar que la animación del frontend termine (ej. 12 segundos)
        setTimeout(async () => {
            try {
                // 6. Determinar el ganador
                const winner = battleState.players.reduce((prev, current) =>
                    (prev.totalValue > current.totalValue) ? prev : current
                );

                // 7. Si el ganador es un usuario real, transferirle los premios
                if (!winner.isBot) {
                    const allSkins = battleState.players.map(p => p.wonSkin);
                    const totalWinValue = allSkins.reduce((sum, skin) => sum + skin.value, 0);
                    
                    const winnerUser = await User.findById(winner.userId);
                    const inventoryUpdates = allSkins.map(skin => ({ skin: skin._id }));
                    winnerUser.inventory.push(...inventoryUpdates);
                    
                    await winnerUser.save();

                    // Registrar la transacción de la ganancia
                    await Transaction.create({
                        user: winner.userId,
                        type: 'battleWin',
                        amount: totalWinValue - caseWithSkins.price, // Ganancia neta
                        details: { battleId, skinsWon: allSkins.length },
                        balanceAfter: winnerUser.balance,
                    });
                }

                // 8. Actualizar la batalla en la BD como finalizada
                await Battle.findByIdAndUpdate(battleId, {
                    status: 'finished',
                    winner: winner.isBot ? null : winner.userId, // Guarda el ID del usuario si no es un bot
                    'participants.$[].openedSkins': battleState.players.map(p => p.wonSkin._id),
                });
                
                // 9. Notificar al frontend sobre el ganador
                io.to(battleId).emit('battle:finished', { winner });

                // 10. Limpiar la batalla de la memoria
                delete activeBattles[battleId];

            } catch (err) {
                console.error(`[Battle Error - Finalizing] ${battleId}:`, err);
                io.to(battleId).emit('battle:error', 'Error al finalizar la batalla.');
                delete activeBattles[battleId];
            }
        }, 12000); // Tiempo de espera para la animación

    } catch (err) {
        console.error(`[Battle Error - Starting] ${battleId}:`, err);
        io.to(battleId).emit('battle:error', 'Error al iniciar la batalla.');
        delete activeBattles[battleId];
    }
}


// --- MANEJADOR DE EVENTOS DE SOCKET ---
module.exports = (io, socket) => {
    // El usuario se conecta y quiere ver las batallas disponibles
    socket.on('battles:fetchList', (callback) => {
        const pendingBattles = Object.entries(activeBattles)
            .filter(([, state]) => state.status === 'pending')
            .map(([id, state]) => ({ id, ...state }));
        callback(pendingBattles);
    });

    // Un usuario crea una nueva batalla
    socket.on('battle:create', async ({ caseId, numPlayers }, callback) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const caseToOpen = await Case.findById(caseId).session(session);
            if (!caseToOpen) throw new Error('La caja no existe.');

            const user = await User.findById(socket.user.id).session(session);
            if (user.balance < caseToOpen.price) throw new Error('Saldo insuficiente.');

            user.balance -= caseToOpen.price;

            const battle = new Battle({
                case: caseId,
                participants: [{ user: user._id, openedSkins: [], totalValue: 0 }],
                status: 'pending',
            });
            
            await battle.save({ session });

            await Transaction.create([{
                user: user._id,
                type: 'buyCase',
                amount: -caseToOpen.price,
                details: { caseId, context: 'battle' },
                balanceAfter: user.balance
            }], { session });

            await user.save({ session });
            await session.commitTransaction();

            // Guardar en memoria
            activeBattles[battle._id] = {
                caseId: caseId,
                caseName: caseToOpen.name,
                casePrice: caseToOpen.price,
                maxPlayers: numPlayers,
                status: 'pending',
                players: [{
                    userId: socket.user.id,
                    username: socket.user.username,
                    avatar: socket.user.avatar,
                }],
            };

            socket.join(battle._id.toString());
            io.emit('battles:list:update', { new: { id: battle._id, ...activeBattles[battle._id] } }); // Actualizar lobby para todos
            callback({ success: true, battleId: battle._id });

        } catch (err) {
            await session.abortTransaction();
            console.error(`[Battle Create Error] User ${socket.user.username}:`, err);
            callback({ error: err.message });
        } finally {
            session.endSession();
        }
    });

    // Un usuario se une a una batalla existente
    socket.on('battle:join', async ({ battleId }, callback) => {
        const battleState = activeBattles[battleId];
        if (!battleState || battleState.status !== 'pending' || battleState.players.length >= battleState.maxPlayers) {
            return callback({ error: 'No se puede unir a esta batalla.' });
        }

        if (battleState.players.some(p => p.userId === socket.user.id)) {
            return callback({ error: 'Ya estás en esta batalla.' });
        }
        
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findById(socket.user.id).session(session);
            if (user.balance < battleState.casePrice) throw new Error('Saldo insuficiente.');
            
            user.balance -= battleState.casePrice;
            
            const battleInDb = await Battle.findById(battleId).session(session);
            battleInDb.participants.push({ user: user._id });

            await battleInDb.save({ session });

            await Transaction.create([{
                user: user._id,
                type: 'buyCase',
                amount: -battleState.casePrice,
                details: { caseId: battleState.caseId, context: 'battle' },
                balanceAfter: user.balance
            }], { session });

            await user.save({ session });
            await session.commitTransaction();

            // Actualizar estado en memoria
            battleState.players.push({
                userId: socket.user.id,
                username: socket.user.username,
                avatar: socket.user.avatar,
            });

            socket.join(battleId);
            io.to(battleId).emit('battle:state:update', battleState); // Notificar a los del room
            io.emit('battles:list:update', { updated: { id: battleId, ...battleState } }); // Actualizar lobby para todos
            callback({ success: true });

            // Si la batalla se llena, comienza
            if (battleState.players.length === battleState.maxPlayers) {
                startBattle(io, battleId);
            }

        } catch (err) {
            await session.abortTransaction();
            console.error(`[Battle Join Error] User ${socket.user.username}:`, err);
            callback({ error: err.message });
        } finally {
            session.endSession();
        }
    });
};