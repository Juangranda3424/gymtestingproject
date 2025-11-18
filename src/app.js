const express = require('express');
const clientRoutes = require('./routes/clients.routes');
const trainerRoutes = require('./routes/trainers.routes');
const classesRoutes = require('./routes/classes.routes');
const membershipRoutes = require('./routes/membership.routes');

const app = express();

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Ruta base para los clientes
app.use('/api/clients', clientRoutes);
// Ruta base para los entrenadores
app.use('/api/trainers', trainerRoutes);
// Ruta base para las clases
app.use('/api/classes', classesRoutes);
// Ruta base para las membresías
app.use('/api/memberships', membershipRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;