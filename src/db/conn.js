const { Pool } = require('pg');
const config = require('../config');

// Configuración del pool de conexiones
const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  max: 20,
  idleTimeoutMillis: 30000,
});

// Evento para manejar errores del pool
pool.on('connect', () => {
  console.log('Conexión a la base de datos exitosa!');
});

module.exports = pool;
