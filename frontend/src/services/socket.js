import { io } from 'socket.io-client';

const URL = 'http://localhost:5000'; // La URL de tu servidor backend

// Función para inicializar y obtener el socket
const getSocket = () => {
    const token = localStorage.getItem('token');

    // Creamos la instancia del socket
    const socket = io(URL, {
        // Opción clave: enviamos el token en el handshake de conexión
        // para que el middleware `protectSocket` del backend pueda verificarlo.
        auth: {
            token: token 
        },
        // Conectamos manualmente para tener más control
        autoConnect: false 
    });

    return socket;
};

export default getSocket;