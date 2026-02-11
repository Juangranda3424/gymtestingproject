require('dotenv').config();

// Configuración de la base de datos
module.exports = {
  db: {
    host: process.env.DB_HOST || process.env.PGHOST,
    user: process.env.DB_USER || process.env.PGUSER,
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
    database: process.env.DB_NAME || process.env.PGDATABASE,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.DB_SSL === 'true' || process.env.VERCEL === '1',
  }
};