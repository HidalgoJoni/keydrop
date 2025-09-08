import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api','') : 'http://localhost:5000';
let socket = null;

export function connectSocket(token) {
  if (!socket) {
    const auth = token ? { auth: { token } } : { };
    socket = io(URL, { transports: ['websocket'], ...auth });
  }
  return socket;
}

export function getSocket() {
  return socket;
}