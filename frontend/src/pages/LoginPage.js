import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.scss';

const LoginPage = ({ onSuccess }) => {
  const { saveAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const res = await api.post('/auth/register', { username, email, password });
        saveAuth(res.data.token, res.data.user);
      } else {
        const res = await api.post('/auth/login', { email, password });
        saveAuth(res.data.token, res.data.user);
      }
      onSuccess && onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {isRegister && (
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        )}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="btn">{isRegister ? 'Register' : 'Login'}</button>
        <button type="button" className="btn ghost" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;