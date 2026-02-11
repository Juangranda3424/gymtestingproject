const { Pool } = require('pg');

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

// Evento para manejar errores del pool
pool.on('connect', () => {
  console.log('Conexión a la base de datos exitosa!');
});

module.exports = pool;
