require('dotenv').config({ path: '.env.dev' });

module.exports = {
  db: {
    host: process.env.DB_HOST,    // 'localhost'
    user: process.env.DB_USER,    // 'root'
    password: process.env.DB_PASSWORD,    // 'password'
    database: process.env.DB_NAME,    // 'gymdb'
    port: Number(process.env.DB_PORT),    // 3306
  }
};