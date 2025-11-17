const pool = require('../db/conn'); // Importar el pool de conexiones a PostgreSQL

/**
 * Obtener todos los entrenadores
 * GET /api/trainers
 */
const getAllTrainers = async (req, res) => {
  try {
    // Ejecuta la consulta para obtener todos los entrenadores
    const result = await pool.query('SELECT * FROM entrenadores');
    // Retorna los resultados como JSON
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    // Si ocurre un error en la consulta, retorna un 500
    res.status(500).json({ error: 'Error obteniendo entrenadores' });
  }
};

/**
 * Obtener un entrenador por ID
 * GET /api/trainers/:id
 */
const getTrainerById = async (req, res) => {
  const { id } = req.params; // Obtener el ID desde los parámetros de la ruta
  try {
    const result = await pool.query(
      'SELECT * FROM entrenadores WHERE id_entrenador=$1',
      [id] // Usar parámetros para evitar SQL Injection
    );

    // Si no se encuentra el entrenador, retornar 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Entrenador no encontrado' });
    }

    // Retorna el entrenador encontrado
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo entrenador' });
  }
};

/**
 * Crear un nuevo entrenador
 * POST /api/trainers
 */
const createTrainer = async (req, res) => {
  // Extraer datos del cuerpo de la solicitud
  const { nombre, apellido, email, telefono, especialidad, fecha_contratacion } = req.body;

  // Validar que los campos obligatorios estén presentes
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Datos del entrenador inválidos' });
  }

  try {
    // Ejecuta la consulta para insertar un nuevo entrenador
    const result = await pool.query(
      `INSERT INTO entrenadores 
      (nombre, apellido, email, telefono, especialidad, fecha_contratacion) 
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre, apellido, email, telefono, especialidad, fecha_contratacion]
    );

    // Retorna el entrenador creado con código 201 (Created)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando entrenador' });
  }
};

/**
 * Actualizar un entrenador existente
 * PUT /api/trainers/:id
 */
const updateTrainer = async (req, res) => {
  const { id } = req.params; // ID del entrenador a actualizar
  const { nombre, apellido, email, telefono, especialidad, fecha_contratacion, estado } = req.body;
  
  // Validar que los campos obligatorios estén presentes
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Actualización de datos del entrenador inválida' });
  }

  try {
    // Ejecuta la consulta para actualizar el entrenador
    const result = await pool.query(
      `UPDATE entrenadores SET 
        nombre=$1, apellido=$2, email=$3, telefono=$4, especialidad=$5, fecha_contratacion=$6, estado=$7 
        WHERE id_entrenador=$8 RETURNING *`,
      [nombre, apellido, email, telefono, especialidad, fecha_contratacion, estado, id]
    );

    // Si no se encuentra el entrenador, retorna 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Entrenador no encontrado' });
    }

    // Retorna el entrenador actualizado
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
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
    // Ejecuta la consulta para eliminar el entrenador
    const result = await pool.query(
      'DELETE FROM entrenadores WHERE id_entrenador=$1 RETURNING *',
      [id]
    );

    // Si no se encuentra el entrenador, retorna 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Entrenador no encontrado' });
    }

    // Retorna un mensaje de éxito y los datos del entrenador eliminado
    res.json({
      message: 'Entrenador eliminado correctamente',
      entrenador: result.rows[0]
    });
  } catch (err) {
    console.error(err);
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
