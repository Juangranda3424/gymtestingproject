const express = require('express');
const clientRoutes = require('./routes/clients.routes');

const app = express();

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Ruta base para los clientes
app.use('/api/clients', clientRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;