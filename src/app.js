require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clients.routes');
const trainerRoutes = require('./routes/trainers.routes');
const classesRoutes = require('./routes/classes.routes');
const membershipRoutes = require('./routes/membership.routes');
const inscriptionsRoutes = require('./routes/inscriptions.routes');
const paymentsRoutes = require('./routes/payments.routes');

const app = express();

// Middleware para habilitar CORS
app.use(cors()); // - Esto permite peticiones desde cualquier origen por defecto

// Middleware para parsear JSON del cuerpo de las solicitudes
app.use(express.json());

// Ruta raíz para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ message: 'Gym API is running', status: 'ok' });
});

// Ruta base para los clientes en la base de datos
app.use('/api/clients', clientRoutes);
// Ruta base para los entrenadores
app.use('/api/trainers', trainerRoutes);
// Ruta base para las clases
app.use('/api/classes', classesRoutes);
// Ruta base para las membresías
app.use('/api/memberships', membershipRoutes);
// Ruta base para las inscripciones
app.use('/api/inscriptions', inscriptionsRoutes);
// Ruta base para los pagos
app.use('/api/payments', paymentsRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Solo iniciar servidor si no estamos en Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;