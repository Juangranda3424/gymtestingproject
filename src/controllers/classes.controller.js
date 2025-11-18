const pool = require('../db/conn');

/**
 * Validacion: string t es un tiempo válido en formato HH:MM
 */
const isValidTime = (t) => {
  // acepta HH:MM formato 24h
  return typeof t === 'string' && /^\d{2}:\d{2}$/.test(t) && (() => {
    const [hh, mm] = t.split(':').map(Number);
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  })();
};

const validDays = ['Lunes','Martes','Miércoles','Miercoles','Jueves','Viernes','Sábado','Sabado','Domingo'];

/**
 * GET /api/classes
 * Obtener todas las clases
 */
const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, e.nombre AS entrenador_nombre, e.apellido AS entrenador_apellido
      FROM clases c
      LEFT JOIN entrenadores e ON c.id_entrenador = e.id_entrenador
      ORDER BY c.id_clase
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error obteniendo clases' });
  }
};

/**
 * GET /api/classes/:id
 * Obtener clase por id
 */
const getClassById = async (req, res) => {
  const { id } = req.params;
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const result = await pool.query(`
      SELECT c.*, e.nombre AS entrenador_nombre, e.apellido AS entrenador_apellido
      FROM clases c
      LEFT JOIN entrenadores e ON c.id_entrenador = e.id_entrenador
      WHERE c.id_clase = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error obteniendo clase' });
  }
};

/**
 * POST /api/classes
 * Crear una nueva clase
 */
const createClass = async (req, res) => {
  const { nombre_clase, descripcion, horario, dia_semana, id_entrenador } = req.body;

  // Validaciones básicas
  if (!nombre_clase || typeof nombre_clase !== 'string' || nombre_clase.trim().length < 2) {
    return res.status(400).json({ message: 'nombre_clase es obligatorio y debe tener al menos 2 caracteres' });
  }
  if (!horario || !isValidTime(horario)) {
    return res.status(400).json({ message: 'horario es obligatorio y debe tener formato HH:MM' });
  }
  if (!dia_semana || typeof dia_semana !== 'string' || !validDays.includes(dia_semana)) {
    return res.status(400).json({ message: `dia_semana inválido. Valores válidos: ${validDays.join(', ')}` });
  }

  try {
    // Si se proporcionó id_entrenador, verificar existencia
    let entrenadorId = null;
    if (id_entrenador !== undefined && id_entrenador !== null) {
      if (Number.isNaN(Number(id_entrenador))) {
        return res.status(400).json({ message: 'id_entrenador invalido' });
      }
      const trainerCheck = await pool.query('SELECT id_entrenador FROM entrenadores WHERE id_entrenador=$1', [id_entrenador]);
      if (trainerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Entrenador especificado no existe' });
      }
      entrenadorId = Number(id_entrenador);
    }

    const result = await pool.query(
      `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre_clase.trim(), descripcion || null, horario, dia_semana, entrenadorId]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error creando clase' });
  }
};

/**
 * PUT /api/classes/:id
 */
const updateClass = async (req, res) => {
  const { id } = req.params;
  const { nombre_clase, descripcion, horario, dia_semana, id_entrenador } = req.body;

  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  // Validaciones parciales solo si se envían
  if (nombre_clase !== undefined && (typeof nombre_clase !== 'string' || nombre_clase.trim().length < 2)) {
    return res.status(400).json({ message: 'nombre_clase debe tener al menos 2 caracteres' });
  }
  if (horario !== undefined && !isValidTime(horario)) {
    return res.status(400).json({ message: 'horario debe tener formato HH:MM' });
  }
  if (dia_semana !== undefined && !validDays.includes(dia_semana)) {
    return res.status(400).json({ message: `dia_semana inválido. Valores válidos: ${validDays.join(', ')}` });
  }

  try {
    // Validación de id_entrenador si se proporciona
    if (id_entrenador !== undefined && id_entrenador !== null) {
      if (Number.isNaN(Number(id_entrenador))) {
        return res.status(400).json({ message: 'id_entrenador inválido' });
      }
      const trainerCheck = await pool.query(
        'SELECT id_entrenador FROM entrenadores WHERE id_entrenador=$1',
        [id_entrenador]
      );
      if (trainerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Entrenador especificado no existe' });
      }
    }

    // Construir consulta dinámica
    const fields = [];
    const values = [];
    let idx = 1;

    if (nombre_clase !== undefined) { fields.push(`nombre_clase=$${idx++}`); values.push(nombre_clase.trim()); }
    if (descripcion !== undefined) { fields.push(`descripcion=$${idx++}`); values.push(descripcion); }
    if (horario !== undefined) { fields.push(`horario=$${idx++}`); values.push(horario); }
    if (dia_semana !== undefined) { fields.push(`dia_semana=$${idx++}`); values.push(dia_semana); }
    if (id_entrenador !== undefined) { fields.push(`id_entrenador=$${idx++}`); values.push(id_entrenador === null ? null : Number(id_entrenador)); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    // agregar id al final
    values.push(id);

    const query = `UPDATE clases SET ${fields.join(', ')} WHERE id_clase=$${idx} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error actualizando clase' });
  }
};

/**
 * DELETE /api/classes/:id
 * Eliminar clase (Delete físico)
 */
const deleteClass = async (req, res) => {
  const { id } = req.params;
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const result = await pool.query('DELETE FROM clases WHERE id_clase=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    return res.json({ message: 'Clase eliminada correctamente', clase: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error eliminando clase' });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
