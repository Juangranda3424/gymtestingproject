const pool = require('../db/conn');

/*
    Devuelve todas las membresías almacenadas en la base de datos
*/
async function getAllMemberships(req, res) {
  try {
    const result = await pool.query('SELECT * FROM membresias');
    res.status(200).json(result.rows);
  } catch {
    res.status(500).json({ message: 'Error al obtener las membresías' });
  }
}

/*
    Crea una membresía nueva en la base de datos
*/
async function createMembership(req, res) {
  try {
    const { tipo, precio, duracion_meses } = req.body;

    if (!tipo || !precio || !duracion_meses) {
      return res.status(400).json({ message: 'Faltan datos de la membresía' });
    }

    // Evitamos duplicar tipos de membresía
    const search = await pool.query(
      'SELECT * FROM membresias WHERE tipo=$1',
      [tipo]
    );

    if (search.rows.length > 0) {
      return res.status(409).json({ message: 'La membresía ya existe' });
    }

    const result = await pool.query(
      `INSERT INTO membresias (tipo, precio, duracion_meses)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [tipo, precio, duracion_meses]
    );

    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Error al crear la membresía' });
  }
}

/*
    Actualiza una membresía en la base de datos
*/
async function updateMembership(req, res) {
  try {
    const { tipo, precio, duracion_meses } = req.body;
    const { id } = req.params;

    if (!tipo && !precio && !duracion_meses) {
      return res.status(400).json({
        message: 'Actualización de datos de la membresía inválida'
      });
    }

    const result = await pool.query(
      `UPDATE membresias 
       SET tipo=$1, precio=$2, duracion_meses=$3
       WHERE id_membresia=$4
       RETURNING *`,
      [tipo, precio, duracion_meses, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Membresía no encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Error al actualizar la membresía' });
  }
}

/*
    Elimina una membresía de la base de datos
    (física, ya que la tabla no tiene campo "estado")
*/
async function deleteMembership(req, res) {
  try {
    const { id } = req.params;

    const search = await pool.query(
      'SELECT * FROM membresias WHERE id_membresia=$1',
      [id]
    );

    if (search.rows.length === 0) {
      return res.status(404).json({ message: 'Membresía no encontrada' });
    }

    const resultDelete = await pool.query(
      'DELETE FROM membresias WHERE id_membresia=$1 RETURNING *',
      [id]
    );

    res.status(200).json(resultDelete.rows[0]);
  } catch {
    res.status(500).json({ message: 'Error al eliminar la membresía' });
  }
}

module.exports = {
  getAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership
};
