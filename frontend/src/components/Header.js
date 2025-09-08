import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.scss';

const Header = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="main-header">
            <Link to="/" className="header-logo">CS:CLONE</Link>
            <nav className="header-nav">
                <NavLink to="/">Cajas</NavLink>
                {user && <NavLink to="/inventory">Inventario</NavLink>}
                <NavLink to="/upgrades">Upgrade</NavLink>
                <NavLink to="/battles">Batallas</NavLink>
            </nav>
            <div className="header-user">
                {user ? (
                    <>
                        <div className="user-balance">
                            ${user.balance.toFixed(2)}
                        </div>
                        <span className="user-name">{user.username}</span>
                        <button onClick={logout} className="btn btn--secondary">Salir</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn--secondary">Login</Link>
                        <Link to="/register" className="btn btn--primary">Registro</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;