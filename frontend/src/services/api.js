import axios from 'axios';

// Creamos una instancia de Axios con la URL base de nuestro backend
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

/**
 * Interceptor de peticiones:
 * Esta función se ejecuta ANTES de que cada petición sea enviada.
 * Su trabajo es buscar el token en localStorage y, si existe,
 * añadirlo a la cabecera 'Authorization'.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;