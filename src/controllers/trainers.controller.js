const pool = require('../db/conn'); 

/**
 * GET /api/trainers
 * Obtener todos los entrenadores
*/
const getAllTrainers = async (req, res) => {
  try {
    // Todos los entrenadores
    const result = await pool.query('SELECT * FROM entrenadores');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo entrenadores' });
  }
};

/**
 * GET /api/trainers/:id
 * Obtener un entrenador por ID
*/
const getTrainerById = async (req, res) => {
  const { id } = req.params; 
  try {
    // Consulta Entrenador por ID 
    const result = await pool.query(
      'SELECT * FROM entrenadores WHERE id_entrenador=$1',
      [id]
    );

    // Entrenador no encontrado
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Entrenador no encontrado' });
    }

    // Entrenador encontrado
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo entrenador' });
  }
};

/**
 * POST /api/trainers
 * Crear un nuevo entrenador
*/
const createTrainer = async (req, res) => {
  // Extraer datos del cuerpo de la solicitud
  const { nombre, apellido, email, telefono, especialidad, fecha_contratacion } = req.body;

  // Validacion de campos obligatorios
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Datos del entrenador inválidos' });
  }

  try {
    // Insertar un nuevo entrenador
    const result = await pool.query(
      `INSERT INTO entrenadores 
      (nombre, apellido, email, telefono, especialidad, fecha_contratacion) 
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre, apellido, email, telefono, especialidad, fecha_contratacion]
    );

    // Entrenador creado (201)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creando entrenador' });
  }
};

/**
 * Actualizar un entrenador existente
 * PUT /api/trainers/:id
 */
const updateTrainer = async (req, res) => {
  const { id } = req.params;

  // Campos que pueden ser actualizados
  const { nombre, apellido, email, telefono, especialidad, fecha_contratacion, estado } = req.body;
  
  // Validacion de campos obligatorios 
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Actualización de datos del entrenador inválida' });
  }

  try {
    // Actualizar el entrenador con parametros
    const result = await pool.query(
      `UPDATE entrenadores SET 
        nombre=$1, apellido=$2, email=$3, telefono=$4, especialidad=$5, fecha_contratacion=$6, estado=$7 
        WHERE id_entrenador=$8 RETURNING *`,
      [nombre, apellido, email, telefono, especialidad, fecha_contratacion, estado, id]
    );

    // Entrenador no encontrado
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Entrenador no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando entrenador' });
  }
};

/**
 * Eliminar un entrenador
 * DELETE /api/trainers/:id
 */
const deleteTrainer = async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar el entrenador ID 
    const result = await pool.query(
      'DELETE FROM entrenadores WHERE id_entrenador=$1 RETURNING *',
      [id]
    );

    // Entrenador no encontrado
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Entrenador no encontrado' });
    }

    // Entrenador eliminado con datos 
    res.json({
      message: 'Entrenador eliminado correctamente',
      entrenador: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando entrenador' });
  }
};

// Exportar todas las funciones del controlador
module.exports = {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer
};
