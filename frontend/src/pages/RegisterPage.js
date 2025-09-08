import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './RegisterPage.scss';

const RegisterPage = () => {
    // Estados para cada campo del formulario y para los mensajes de error
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Obtenemos la función 'register' de nuestro contexto global
    const { register } = useContext(AuthContext);
    
    // Hook para navegar a otras rutas después del registro
    const navigate = useNavigate();

    // Función que se ejecuta al enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        setError(''); // Limpiamos errores anteriores

        // Validación simple del lado del cliente
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            // Llamamos a la función register del AuthContext
            await register(username, email, password);
            // Si el registro es exitoso, redirigimos a la página principal
            navigate('/');
        } catch (err) {
            // Si hay un error (ej. usuario ya existe), lo mostramos
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