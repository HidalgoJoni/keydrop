import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setToken(parsed.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      // fetch full user
      api.get('/users/me').then(res => {
        setUser(res.data.user);
      }).catch(()=>{
        setUser(parsed.user);
      });
    }
  }, []);

  const saveAuth = (token, user) => {
    setToken(token);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/users/me').then(res => {
      setUser(res.data.user);
      localStorage.setItem('auth', JSON.stringify({ token, user: res.data.user }));
    }).catch(()=>{
      localStorage.setItem('auth', JSON.stringify({ token, user }));
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth');
  };

  const updateBalance = (newBalance) => {
    if (!user) return;
    const updated = { ...user, balance: newBalance };
    setUser(updated);
    const saved = JSON.parse(localStorage.getItem('auth') || '{}');
    localStorage.setItem('auth', JSON.stringify({ token: saved.token || token, user: updated }));
  };

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};