import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Este efecto se ejecuta solo una vez cuando la aplicación carga
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Si encontramos un token, intentamos obtener el perfil del usuario
            api.get('/auth/profile')
                .then(response => {
                    // Si el token es válido, guardamos los datos del usuario
                    setUser(response.data);
                })
                .catch(() => {
                    // Si el token es inválido (ej. ha expirado), lo eliminamos
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    // Terminamos de cargar, independientemente del resultado
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, ...userData } = response.data;
        
        // Guardamos el token en el almacenamiento local para persistir la sesión
        localStorage.setItem('token', token);
        // Actualizamos el estado con los datos del usuario
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };
    
    // Función para que otros componentes puedan actualizar el saldo del usuario
    const updateBalance = (newBalance) => {
        setUser(currentUser => ({ ...currentUser, balance: newBalance }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateBalance, loading }}>
            {/* No mostramos la app hasta que se verifique si hay un usuario logueado */}
            {!loading && children}
        </AuthContext.Provider>
    );
};