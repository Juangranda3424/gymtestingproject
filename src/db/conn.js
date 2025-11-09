const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
    max: 20,
    idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('Conexión a la base de datos exitosa!');
});

module.exports = pool;
