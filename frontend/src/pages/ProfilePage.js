// src/pages/ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './ProfilePage.scss';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const res = await api.get('/transactions');
      setHistory(res.data.transactions || []);
    };
    fetchHistory();
  }, [user]);

  if (!user) return <div className="container">Please login to see profile.</div>;

  return (
    <div className="profile-page container">
      <h2>Profile: {user.username}</h2>
      <div>Balance: {user.balance}</div>
      <h3>History</h3>
      <div className="history-list">
        {history.map(h => (
          <div key={h._id} className="history-item">{h.type} - {JSON.stringify(h.details)} - {new Date(h.createdAt).toLocaleString()}</div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
