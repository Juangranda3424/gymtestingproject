const pool = require('../db/conn');

/**
 * GET /api/inscriptions
 * Obtener todas las inscripciones
 */
const getAllInscriptions = async (req, res) => {
  try {
    // Consulta que une inscripciones con clientes y clases para mostrar datos completos
    const result = await pool.query(`
      SELECT i.id_inscripcion, i.fecha_inscripcion,
             c.id_cliente, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
             cl.id_clase, cl.nombre_clase
      FROM inscripciones i
      JOIN clientes c ON i.id_cliente = c.id_cliente
      JOIN clases cl ON i.id_clase = cl.id_clase
      ORDER BY i.id_inscripcion
    `);
    return res.json(result.rows);
  } catch {
    return res.status(500).json({ error: 'Error obteniendo inscripciones' });
  }
};

/**
 * GET /api/inscriptions/:id
 * Obtener inscripción por id
 */
const getInscriptionById = async (req, res) => {
  const { id } = req.params;

  // Validacion: ID debe ser un numero válido
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    // Busca una inscripción especifica con datos del cliente y la clase
    const result = await pool.query(`
      SELECT i.id_inscripcion, i.fecha_inscripcion,
             c.id_cliente, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
             cl.id_clase, cl.nombre_clase
      FROM inscripciones i
      JOIN clientes c ON i.id_cliente = c.id_cliente
      JOIN clases cl ON i.id_clase = cl.id_clase
      WHERE i.id_inscripcion = $1
    `, [id]);

    // Si no existe
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }

    // Devuelve la inscripcion encontrada
    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error obteniendo inscripción' });
  }
};

/**
 * POST /api/inscriptions
 * Crear una nueva inscripción
 */
const createInscription = async (req, res) => {
  const { id_cliente, id_clase } = req.body;

  // Validacion básica de campos requeridos
  if (!id_cliente || !id_clase) {
    return res.status(400).json({ message: 'id_cliente e id_clase son requeridos' });
  }

  try {
    // Verifica que el cliente exista antes de inscribirlo
    const cliente = await pool.query('SELECT id_cliente FROM clientes WHERE id_cliente=$1', [id_cliente]);
    if (cliente.rows.length === 0) return res.status(400).json({ message: 'Cliente no existe' });
    // Verifica que la clase exista
    const clase = await pool.query('SELECT id_clase FROM clases WHERE id_clase=$1', [id_clase]);
    if (clase.rows.length === 0) return res.status(400).json({ message: 'Clase no existe' });

    // Inserta la inscripcion en la tabla
    const result = await pool.query(`
      INSERT INTO inscripciones (id_cliente, id_clase)
      VALUES ($1, $2)
      RETURNING *
    `, [id_cliente, id_clase]);

    return res.status(201).json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error creando inscripción' });
  }
};

/**
 * PUT /api/inscriptions/:id
 * Actualizar inscripción (solo cambiar clase)
 */
const updateInscription = async (req, res) => {
  const { id } = req.params;
  const { id_clase } = req.body;

  // Validaciones
  if (!id || Number.isNaN(Number(id))) return res.status(400).json({ message: 'ID inválido' });
  if (!id_clase) return res.status(400).json({ message: 'id_clase es requerido' });

  try {
    // Verifica que la nueva clase exista
    const clase = await pool.query('SELECT id_clase FROM clases WHERE id_clase=$1', [id_clase]);
    if (clase.rows.length === 0) return res.status(400).json({ message: 'Clase no existe' });

    // Actualiza la inscripcion
    const result = await pool.query(`
      UPDATE inscripciones
      SET id_clase=$1
      WHERE id_inscripcion=$2
      RETURNING *
    `, [id_clase, id]);

    // Si no existe la inscripcion
    if (result.rows.length === 0) return res.status(404).json({ message: 'Inscripción no encontrada' });

    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error actualizando inscripción' });
  }
};

/**
 * DELETE /api/inscriptions/:id
 * Eliminar inscripción
 */
const deleteInscription = async (req, res) => {
  const { id } = req.params;

  // Validación del ID
  if (!id || Number.isNaN(Number(id))) return res.status(400).json({ message: 'ID inválido' });

  try {
    // Elimina la inscripcion
    const result = await pool.query('DELETE FROM inscripciones WHERE id_inscripcion=$1 RETURNING *', [id]);

    // Si la inscripción no existe
    if (result.rows.length === 0) return res.status(404).json({ message: 'Inscripción no encontrada' });

    // Confirmacion de eliminacion
    return res.json({ message: 'Inscripción eliminada', inscription: result.rows[0] });
  } catch {
    return res.status(500).json({ error: 'Error eliminando inscripción' });
  }
};

// Exporta todas las funciones del controlador
module.exports = {
  getAllInscriptions,
  getInscriptionById,
  createInscription,
  updateInscription,
  deleteInscription,
};
