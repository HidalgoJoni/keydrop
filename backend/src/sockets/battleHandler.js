// sockets/battleHandler.js
const Battle = require('../models/battleModel');
const Case = require('../models/caseModel');
const Bot = require('../models/botModel');
const { getWinningSkin } = require('../services/caseService');
// ... y otros modelos necesarios

// Objeto en memoria para gestionar las batallas activas
const activeBattles = {};

module.exports = (io, socket) => {
    // El usuario se conecta y envía su token para "autenticar" el socket
    // (Esta es una implementación básica de autenticación de sockets)

    socket.on('battle:create', async ({ caseId, numPlayers }) => {
        try {
            const battle = new Battle({
                case: caseId,
                participants: [{ user: socket.user.id, openedSkins: [], totalValue: 0 }],
            });
            await battle.save();

            activeBattles[battle._id] = {
                maxPlayers: numPlayers,
                players: [{ userId: socket.user.id, socketId: socket.id }],
            };
            
            socket.join(battle._id.toString());
            io.to(battle._id.toString()).emit('battle:update', { battle, players: activeBattles[battle._id].players });
        } catch (err) { /* ... manejo de errores ... */ }
    });

    socket.on('battle:join', async ({ battleId }) => {
        try {
            const battle = await Battle.findById(battleId);
            const battleState = activeBattles[battleId];
            if (battle && battleState.players.length < battleState.maxPlayers) {
                battle.participants.push({ user: socket.user.id, openedSkins: [], totalValue: 0 });
                await battle.save();
                
                battleState.players.push({ userId: socket.user.id, socketId: socket.id });
                socket.join(battleId);
                
                io.to(battleId).emit('battle:update', { battle, players: battleState.players });
                
                if (battleState.players.length === battleState.maxPlayers) {
                    // Si se llena, comienza la batalla
                    startBattle(io, battleId);
                }
            }
        } catch (err) { /* ... manejo de errores ... */ }
    });
};

async function startBattle(io, battleId) {
    const battle = await Battle.findById(battleId).populate('case');
    const caseWithSkins = await Case.findById(battle.case._id).populate('possibleSkins.skin');
    
    battle.status = 'ongoing';
    io.to(battleId).emit('battle:starting');
    
    // 1. Abrir cajas para cada participante
    const results = [];
    for (const participant of battle.participants) {
        // ... (lógica para restar saldo al usuario)
        const wonSkin = getWinningSkin(caseWithSkins.possibleSkins);
        participant.openedSkins.push(wonSkin._id);
        participant.totalValue += wonSkin.value;
        results.push({ userId: participant.user, skin: wonSkin });
    }

    // 2. Emitir resultados para la animación en el frontend
    io.to(battleId).emit('battle:results', results);

    // 3. Esperar a que terminen las animaciones
    setTimeout(async () => {
        // 4. Determinar el ganador
        const winner = battle.participants.reduce((prev, current) => 
            (prev.totalValue > current.totalValue) ? prev : current
        );
        battle.winner = winner.user;
        battle.status = 'finished';

        // 5. Transferir todas las skins al ganador
        const winnerUser = await User.findById(winner.user);
        const allSkins = battle.participants.flatMap(p => p.openedSkins);
        allSkins.forEach(skinId => {
            winnerUser.inventory.push({ skin: skinId });
        });
        
        await winnerUser.save();
        await battle.save();

        // 6. Notificar el resultado final
        io.to(battleId).emit('battle:finished', { battle });
        
        // 7. Limpiar la batalla de la memoria
        delete activeBattles[battleId];
    }, 10000); // 10 segundos para la animación
}