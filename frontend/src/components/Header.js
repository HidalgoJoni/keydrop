import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.scss';

const Header = ({ onOpenLogin }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="container">
        <h1 className="logo">CS2 Box Clone</h1>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/market">Market</Link>
          <Link to="/battles">Battles</Link>
          <Link to="/inventory">Inventory</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/leaderboard">Leaderboard</Link>
        </nav>
        <div className="header-right">
          {user ? (
            <>
              <div className="balance">Saldo: {user.balance}</div>
              <button onClick={() => { logout(); navigate('/'); }} className="btn">Logout</button>
            </>
          ) : (
            <button onClick={onOpenLogin} className="btn">Login / Register</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;