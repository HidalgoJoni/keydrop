import axios from 'axios';

// Creamos una instancia de Axios con la URL base de nuestro backend
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

export default api;