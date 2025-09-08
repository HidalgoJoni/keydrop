import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './RegisterPage.scss';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { register } = useContext(AuthContext);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError(''); 
        
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            setError('No se pudo crear la cuenta. El email o usuario ya podría existir.');
            console.error("Error en el registro:", err);
        }
    };

    return (
        <div className="register-page">
            <form onSubmit={handleSubmit} className="register-form">
                <h2 className="register-form__title">Crear Cuenta</h2>
                
                {/* Mostramos el mensaje de error si existe */}
                {error && <p className="register-form__error">{error}</p>}
                
                <div className="form-group">
                    <label htmlFor="username">Nombre de Usuario</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Registrarse
                </button>

                <div className="register-form__login-link">
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;