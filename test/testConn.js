const pool = require('../src/db/conn');

async function probarConexion() {
  try {
    // Hacemos una consulta simple
    const res = await pool.query('SELECT * FROM clases;'); // devuelve las clases
    console.log('Consulta exitosa:', res.rows);
  } catch (err) {
    console.error('Error al conectar o consultar:', err);
  } finally {
    // Cerramos el pool para que todas las conexiones activas se cierren (uso solo en pruebas de conexión)
    await pool.end();
  }
}

probarConexion();
