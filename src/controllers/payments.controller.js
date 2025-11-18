const pool = require('../db/conn');

/**
 * GET /api/payments
 * Obtener todos los pagos
 */
const getAllPayments = async (req, res) => {
  try {
    // Obtener todos los pagos con datos del cliente y membresia
    const result = await pool.query(`
      SELECT p.id_pago, p.fecha_pago, p.monto,
             c.id_cliente, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
             m.id_membresia, m.tipo AS membresia_tipo, m.precio AS membresia_precio
      FROM pagos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN membresias m ON p.id_membresia = m.id_membresia
      ORDER BY p.id_pago
    `);
    return res.json(result.rows);
  } catch {
    return res.status(500).json({ error: 'Error obteniendo pagos' });
  }
};

/**
 * GET /api/payments/:id
 * Obtener pago por id
 */
const getPaymentById = async (req, res) => {
  const { id } = req.params;

  // Validacion id 
  if (!id || Number.isNaN(Number(id))) return res.status(400).json({ message: 'ID inválido' });

  try {
    // Buscar pago por ID
    const result = await pool.query(`
      SELECT p.id_pago, p.fecha_pago, p.monto,
             c.id_cliente, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
             m.id_membresia, m.tipo AS membresia_tipo, m.precio AS membresia_precio
      FROM pagos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN membresias m ON p.id_membresia = m.id_membresia
      WHERE p.id_pago = $1
    `, [id]);

    // Si no existe
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pago no encontrado' });

    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error obteniendo pago' });
  }
};

/**
 * POST /api/payments
 * Crear un nuevo pago
 */
const createPayment = async (req, res) => {
  const { id_cliente, id_membresia, monto } = req.body;

  // Validacion de campos requeridos
  if (!id_cliente || !id_membresia || !monto) {
    return res.status(400).json({ message: 'id_cliente, id_membresia y monto son requeridos' });
  }

  try {
    // Validacion de cliente existente
    const cliente = await pool.query('SELECT id_cliente FROM clientes WHERE id_cliente=$1', [id_cliente]);
    // Cliente NO existe 
    if (cliente.rows.length === 0) return res.status(400).json({ message: 'Cliente no existe' });

    // Validacion de membresia existente
    const membresia = await pool.query('SELECT id_membresia FROM membresias WHERE id_membresia=$1', [id_membresia]);
    if (membresia.rows.length === 0) return res.status(400).json({ message: 'Membresía no existe' });

    // Nuevo pago
    const result = await pool.query(`
      INSERT INTO pagos (id_cliente, id_membresia, monto)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id_cliente, id_membresia, monto]);

    return res.status(201).json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error creando pago' });
  }
};

/**
 * PUT /api/payments/:id
 * Actualizar un pago
 */
const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { id_membresia, monto } = req.body;

  // Validar ID
  if (!id || Number.isNaN(Number(id))) return res.status(400).json({ message: 'ID inválido' });

  try {
    // Validación de membresia
    if (id_membresia !== undefined) {
      const membresia = await pool.query(
        'SELECT id_membresia FROM membresias WHERE id_membresia=$1',
        [id_membresia]
      );
      if (membresia.rows.length === 0) {
        return res.status(400).json({ message: 'Membresía no existe' });
      }
    }

    const fields = [];  // Almacenamiento de partes 
    const values = [];  // Almacenamiento de valores
    let idx = 1;

    // Agregar el ID
    if (id_membresia !== undefined) {
      fields.push(`id_membresia=$${idx++}`);
      values.push(id_membresia);
    }

    // Agrega el monto
    if (monto !== undefined) {
      fields.push(`monto=$${idx++}`);
      values.push(monto);
    }

    // Ningún campo enviado (valores originales)
    if (fields.length === 0) {
      const original = await pool.query(
        'SELECT * FROM pagos WHERE id_pago=$1',
        [id]
      );

      if (original.rows.length === 0) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }

      // No actualiza
      return res.json(original.rows[0]);
    }

    values.push(id);

    // Actulizacion
    const result = await pool.query(
      `UPDATE pagos SET ${fields.join(', ')} WHERE id_pago=$${idx} RETURNING *`,
      values
    );

    // No existe el pago
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pago no encontrado' });

    return res.json(result.rows[0]);
  } catch {
    return res.status(500).json({ error: 'Error actualizando pago' });
  }
};

/**
 * DELETE /api/payments/:id
 * Eliminar un pago
 */
const deletePayment = async (req, res) => {
  const { id } = req.params;

  //Validacion ID
  if (!id || Number.isNaN(Number(id))) return res.status(400).json({ message: 'ID inválido' });

  try {
    // Eliminar pago 
    const result = await pool.query('DELETE FROM pagos WHERE id_pago=$1 RETURNING *', [id]);

    // No existe el pago
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pago no encontrado' });

    return res.json({ message: 'Pago eliminado', payment: result.rows[0] });
  } catch {
    return res.status(500).json({ error: 'Error eliminando pago' });
  }
};

// Exporta todas las funciones del controlador
module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};