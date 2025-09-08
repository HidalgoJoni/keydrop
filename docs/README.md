# cs2-box-clone (minimal scaffold)

Este repositorio contiene un scaffold mínimo para un clon de apertura de cajas para uso privado con saldo ficticio.

Backend quickstart:

1. Instalar dependencias:
   cd backend
   npm install

2. Configurar variables en .env (opcional): MONGODB_URI, JWT_SECRET, PORT

3. Ejecutar seeds para crear datos de prueba:
   node database/seeds/initialSeed.js

4. Ejecutar en modo desarrollo:
   npm run dev

Notas:
- Este scaffold es solo un punto de partida. Implementa autenticación básica, modelos y un socket básico para batallas.
- No manejar dinero real. Todo es saldo ficticio.
