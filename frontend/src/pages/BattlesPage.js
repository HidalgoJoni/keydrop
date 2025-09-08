// src/pages/BattlesPage.js
import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { AuthContext } from '../context/AuthContext';
import OpeningModal from '../components/OpeningModal';
import './BattlesPage.scss';

const BattlesPage = () => {
  const { user } = useContext(AuthContext);
  const [battles, setBattles] = useState([]);
  const [currentBattle, setCurrentBattle] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalBattleId, setModalBattleId] = useState(null);

  useEffect(() => {
    fetchBattles();
    const socket = connectSocket();
    socket.on('player-list', ({ participants }) => setParticipants(participants));
    socket.on('battle-created', ({ battle }) => setCurrentBattle(battle));
    socket.on('battle-started', ({ participants }) => setParticipants(participants));
    socket.on('battle-result', ({ results, winner, winnerSkin }) => {
      setResults({ results, winner, winnerSkin });
      setModalBattleId(null);
      setShowModal(true);
    });
    return () => { socket.off('player-list'); socket.off('battle-created'); socket.off('battle-started'); socket.off('battle-result'); };
  }, []);

  const fetchBattles = async () => {
    const res = await api.get('/battles');
    setBattles(res.data.battles || []);
  };

  const handleCreate = async () => {
    const res = await api.post('/battles/create', { caseId: (await api.get('/cases')).data.cases[0]._id });
    setCurrentBattle(res.data.battle);
    const socket = connectSocket();
    socket.emit('create-battle', { caseId: res.data.battle.caseId });
  };

  const handleJoin = async (battleId) => {
    const socket = connectSocket();
    socket.emit('join-battle', { battleId, userId: user ? user.id : null, username: user ? user.username : 'Guest' });
    setModalBattleId(battleId);
  };

  const handleStart = (battleId) => {
    const socket = getSocket() || connectSocket();
    socket.emit('start-battle', { battleId });
  };

  return (
    <div className="battles-page container">
      <h2>Battles</h2>
      <div className="controls">
        <button className="btn" onClick={handleCreate}>Create Battle</button>
        <button className="btn" onClick={fetchBattles}>Refresh</button>
      </div>
      <div className="battles-list">
        {battles.map(b => (
          <div key={b._id} className="battle-item">
            <div>Battle {b._id}</div>
            <div>Participants: {b.participants.length}</div>
            <div>
              <button onClick={() => handleJoin(b._id)} className="btn">Join</button>
              <button onClick={() => handleStart(b._id)} className="btn">Start</button>
            </div>
          </div>
        ))}
      </div>

      {currentBattle && (
        <div className="current-battle">
          <h3>Current Battle: {currentBattle._id}</h3>
          <div className="participants">
            <h4>Participants</h4>
            {participants.map((p, i) => <div key={i}>{p.username} {p.isBot ? '(Bot)' : ''}</div>)}
          </div>
        </div>
      )}

      {results && (
        <div className="battle-results">
          <h3>Winner: {results.winner.username}</h3>
          <div>Skin: {results.winnerSkin?.name} (value: {results.winnerSkin?.value})</div>
        </div>
      )}

      <OpeningModal caseData={null} isOpen={showModal} onClose={() => setShowModal(false)} battleId={modalBattleId} isBattle={true} />
    </div>
  );
};

export default BattlesPage;
