const pool = require('../db/conn');

/**
 * Validacion: string t es un tiempo válido en formato HH:MM
 */
const isValidTime = (t) => {
  // Validacion que string, coincida con el formato HH:MM 
  return typeof t === 'string' && /^\d{2}:\d{2}$/.test(t) && (() => {
    const [hh, mm] = t.split(':').map(Number);
    // Rango valido
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  })();
};

// Lista de días válidos permitidos para comparar
const validDays = ['Lunes','Martes','Miércoles','Miercoles','Jueves','Viernes','Sábado','Sabado','Domingo'];

/**
 * GET /api/classes
 * Obtener todas las clases
 */
const getAllClasses = async (req, res) => {
  try {
    // Consulta todas las clases junto al nombre del entrenador
    const result = await pool.query(`
      SELECT c.*, e.nombre AS entrenador_nombre, e.apellido AS entrenador_apellido
      FROM clases c
      LEFT JOIN entrenadores e ON c.id_entrenador = e.id_entrenador
      ORDER BY c.id_clase
    `);
    return res.json(result.rows);
  } catch {
    return res.status(500).json({ error: 'Error obteniendo clases' });
  }
};

/**
 * GET /api/classes/:id
 * Obtener clase por id
 */
const getClassById = async (req, res) => {
  const { id } = req.params;
  
  // Validación de ID recibido
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    // Buscar la clase con ID y hacer join con entrenador 
    const result = await pool.query(`
      SELECT c.*, e.nombre AS entrenador_nombre, e.apellido AS entrenador_apellido
      FROM clases c
      LEFT JOIN entrenadores e ON c.id_entrenador = e.id_entrenador
      WHERE c.id_clase = $1
    `, [id]);

    // Si no existe
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error obteniendo clase' });
  }
};

/**
 * POST /api/classes
 * Crear una nueva clase
 */
const createClass = async (req, res) => {
  const { nombre_clase, descripcion, horario, dia_semana, id_entrenador } = req.body;

  // Validacion basica del nombre
  if (!nombre_clase || typeof nombre_clase !== 'string' || nombre_clase.trim().length < 2) {
    return res.status(400).json({ message: 'nombre_clase es obligatorio y debe tener al menos 2 caracteres' });
  }
  // Validacion de horario
  if (!horario || !isValidTime(horario)) {
    return res.status(400).json({ message: 'horario es obligatorio y debe tener formato HH:MM' });
  }
  // Validacion de dia de la semana
  if (!dia_semana || typeof dia_semana !== 'string' || !validDays.includes(dia_semana)) {
    return res.status(400).json({ message: `dia_semana inválido. Valores válidos: ${validDays.join(', ')}` });
  }

  try {
    // Si se envia id_entrenador, validar existencia en BD
    let entrenadorId = null;
    if (id_entrenador !== undefined && id_entrenador !== null) {
      // Si el valor es invalido 
      if (Number.isNaN(Number(id_entrenador))) {
        return res.status(400).json({ message: 'id_entrenador invalido' });
      }
      const trainerCheck = await pool.query('SELECT id_entrenador FROM entrenadores WHERE id_entrenador=$1', [id_entrenador]);
      if (trainerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Entrenador especificado no existe' });
      }
      entrenadorId = Number(id_entrenador);
    }

    // Inserta nueva clase
    const result = await pool.query(
      `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nombre_clase.trim(), descripcion || null, horario, dia_semana, entrenadorId]
    );

    return res.status(201).json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error creando clase' });
  }
};

/**
 * PUT /api/classes/:id
 * Actualizar clase existente parcialmente
 */
const updateClass = async (req, res) => {
  const { id } = req.params;
  const { nombre_clase, descripcion, horario, dia_semana, id_entrenador } = req.body;

  // Validación del ID
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  // Validaciones solo para los campos enviados
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
    // Si se envía id_entrenador, comprobar existencia
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

    // Construcción dinámica del UPDATE según los campos enviados
    const fields = [];
    const values = [];
    let idx = 1;

    // Si se envió nombre_clase en el body
    if (nombre_clase !== undefined) { fields.push(`nombre_clase=$${idx++}`); values.push(nombre_clase.trim()); }
    // Si se envió descripcion
    if (descripcion !== undefined) { fields.push(`descripcion=$${idx++}`); values.push(descripcion); }
    // Si se envió el horario
    if (horario !== undefined) { fields.push(`horario=$${idx++}`); values.push(horario); }
    // Si se envió día
    if (dia_semana !== undefined) { fields.push(`dia_semana=$${idx++}`); values.push(dia_semana); }
    // Si se envió id_entrenador  
    if (id_entrenador !== undefined) { fields.push(`id_entrenador=$${idx++}`); values.push(id_entrenador === null ? null : Number(id_entrenador)); }

    // Si no se envió nada para actualizar
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    // Añadir id al final del array de valores
    values.push(id);

    // Crear consulta final dinámica
    const query = `UPDATE clases SET ${fields.join(', ')} WHERE id_clase=$${idx} RETURNING *`;
    const result = await pool.query(query, values);

    // Verificar que la clase exista
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error actualizando clase' });
  }
};

/**
 * DELETE /api/classes/:id
 * Eliminar clase (Delete físico)
 */
const deleteClass = async (req, res) => {
  const { id } = req.params;

  // Validación del ID
  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    // Elimina y retorna la clase eliminada
    const result = await pool.query('DELETE FROM clases WHERE id_clase=$1 RETURNING *', [id]);

    // Si la clase NO existe
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    return res.json({ message: 'Clase eliminada correctamente', clase: result.rows[0] });
  } catch {
    return res.status(500).json({ error: 'Error eliminando clase' });
  }
};

// Exporta todas las funciones del controlador
module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
