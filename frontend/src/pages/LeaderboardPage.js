import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './LeaderboardPage.scss';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => { api.get('/leaderboard').then(res => setLeaders(res.data.leaders || [])); }, []);

  return (
    <div className="leaderboard container">
      <h2>Leaderboard</h2>
      {leaders.map((l,i) => (
        <div key={l.userId} className="leader-item">{i+1}. {l.username} - Value: {l.totalValue}</div>
      ))}
    </div>
  );
};

export default LeaderboardPage;
