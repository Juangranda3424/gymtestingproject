const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn');

let createdClientId;
let createdMembresiaId;
let createdPaymentId;

describe('GYM - API - PAYMENTS', () => {

  beforeAll(async () => {
    // Crear cliente válido
    const client = await pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono)
       VALUES ($1,$2,$3,$4) RETURNING id_cliente`,
      ['PagoTest', 'User', `pt_${Date.now()}@mail.com`, '0999001123']
    );
    createdClientId = client.rows[0].id_cliente;

    // Crear membresia válida
    const mem = await pool.query(
      `INSERT INTO membresias (tipo, precio, duracion_meses)
       VALUES ($1,$2,$3) RETURNING id_membresia`,
      ['Mensual', 50, 1]
    );
    createdMembresiaId = mem.rows[0].id_membresia;
  });

  // -------------------------------
  // GET ALL
  // -------------------------------

  // Verifica que GET /api/payments devuelve todos los pagos
  test('GET /api/payments should return all payments', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // -------------------------------
  // POST
  // -------------------------------

  // Verifica que POST /api/payments crea un pago correctamente
  test('POST /api/payments should create a payment', async () => {
    const res = await request(app).post('/api/payments').send({
      id_cliente: createdClientId,
      id_membresia: createdMembresiaId,
      monto: 50
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id_pago');

    createdPaymentId = res.body.id_pago;
  });

  // Verifica que POST /api/payments retorna 400 cuando faltan campos
  test('POST /api/payments should return 400 when missing fields', async () => {
    const res = await request(app).post('/api/payments').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('id_cliente, id_membresia y monto son requeridos');
  });

  // Verifica que POST /api/payments retorna 400 si el cliente no existe
  test('POST /api/payments should return 400 when cliente does NOT exist', async () => {
    const res = await request(app).post('/api/payments').send({
      id_cliente: 987654,   // no existe
      id_membresia: createdMembresiaId,
      monto: 20
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cliente no existe');
  });

  // Verifica que POST /api/payments retorna 400 si la membresia no existe
  test('POST /api/payments should return 400 when membresía does NOT exist', async () => {
    const res = await request(app).post('/api/payments').send({
      id_cliente: createdClientId,
      id_membresia: 99999,
      monto: 10
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Membresía no existe');
  });

  // -------------------------------
  // GET ONE
  // -------------------------------

  // Verifica que GET /api/payments/:id devuelve un pago existente
  test('GET /api/payments/:id should return a payment', async () => {
    const res = await request(app).get(`/api/payments/${createdPaymentId}`);
    expect(res.status).toBe(200);
    expect(res.body.id_pago).toBe(createdPaymentId);
  });

  // Verifica que GET /api/payments/:id retorna 400 cuando el ID no es valido
  test('GET /api/payments/:id should return 400 for invalid ID', async () => {
    const res = await request(app).get('/api/payments/abc');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('ID inválido');
  });

  // Verifica que GET /api/payments/:id retorna 404 cuando el pago no existe
  test('GET /api/payments/:id should return 404 when not found', async () => {
    const res = await request(app).get('/api/payments/999999');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pago no encontrado');
  });

  // -------------------------------
  // PUT
  // -------------------------------

  // Verifica que PUT /api/payments/:id actualiza un pago correctamente
  test('PUT /api/payments/:id should update payment', async () => {
    const res = await request(app).put(`/api/payments/${createdPaymentId}`).send({
      monto: 60
    });
    expect(res.status).toBe(200);
    expect(Number(res.body.monto)).toBe(60);
  });

  // Verifica que PUT /api/payments/:id retorna 400 cuando el ID no es valido
  test('PUT /api/payments/:id should return 400 for invalid ID', async () => {
    const res = await request(app).put('/api/payments/abc').send({ monto: 20 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('ID inválido');
  });

  // Verifica que PUT /api/payments/:id retorna el pago original si no se envia ningun campo
  test('PUT /api/payments/:id should return original payment when no fields to update', async () => {
    const res = await request(app).put(`/api/payments/${createdPaymentId}`).send({});
    expect(res.status).toBe(200);
    expect(res.body.id_pago).toBe(createdPaymentId);
  });

  // Verifica que PUT /api/payments/:id retorna 404 cuando el pago no existe
  test('PUT /api/payments/:id should return 404 when payment does NOT exist', async () => {
    const res = await request(app).put('/api/payments/999999').send({ monto: 80 });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pago no encontrado');
  });

  // Verifica que PUT /api/payments/:id retorna 404 cuando el pago no existe y no se envian campos
  test('PUT /api/payments/:id should return 404 when payment does NOT exist and no fields are provided', async () => {
    const res = await request(app).put('/api/payments/999999').send({});
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pago no encontrado');
  });

  // Verifica que PUT /api/payments/:id retorna 400 cuando la membresia enviada no existe
  test('PUT /api/payments/:id should return 400 when membresía does NOT exist', async () => {
    const res = await request(app).put(`/api/payments/${createdPaymentId}`).send({
      id_membresia: 999999
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Membresía no existe');
  });

  // Verifica que PUT /api/payments/:id actualiza monto e id_membresia cuando ambos se envian
  test('PUT /api/payments/:id should update both monto and id_membresia (covers fields/values block)', async () => {
  const newMem = await pool.query(
    `INSERT INTO membresias (tipo, precio, duracion_meses)
     VALUES ($1,$2,$3) RETURNING id_membresia`,
    ['Anual', 500, 12]
  );
  const newMemId = newMem.rows[0].id_membresia;
  const res = await request(app).put(`/api/payments/${createdPaymentId}`).send({id_membresia: newMemId, monto: 99.99});
    expect(res.status).toBe(200);
    expect(Number(res.body.monto)).toBe(99.99);
    expect(res.body.id_membresia).toBe(newMemId);
  });

  // -------------------------------
  // DELETE
  // -------------------------------

  // Verifica que DELETE /api/payments/:id elimina un pago correctamente
  test('DELETE /api/payments/:id should delete payment', async () => {
    const res = await request(app).delete(`/api/payments/${createdPaymentId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Pago eliminado');
  });

  // Verifica que DELETE /api/payments/:id retorna 400 cuando el ID no es valido
  test('DELETE /api/payments/:id should return 400 for invalid ID', async () => {
    const res = await request(app).delete('/api/payments/abc');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('ID inválido');
  });

  // Verifica que DELETE /api/payments/:id retorna 404 cuando el pago no existe
  test('DELETE /api/payments/:id should return 404 for non-existent ID', async () => {
    const res = await request(app).delete('/api/payments/888888');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pago no encontrado');
  });

  afterAll(async () => {
    await pool.end();
  });
});

// -------------------
// ERROR 500 
// -------------------
describe('GYM - API - PAYMENTS ERROR 500', () => {

  // Verifica que GET /api/payments retorna 500 cuando la BD falla
  test('GET /api/payments should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/payments');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error obteniendo pagos');

    spy.mockRestore();
  });

  // Verifica que GET /api/payments/:id retorna 500 cuando la BD falla
  test('GET /api/payments/:id should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/payments/1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error obteniendo pago');

    spy.mockRestore();
  });

  // Verifica que POST /api/payments retorna 500 cuando la BD falla
  test('POST /api/payments should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/payments').send({
      id_cliente: 1,
      id_membresia: 1,
      monto: 10
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error creando pago');

    spy.mockRestore();
  });

  // Verifica que PUT /api/payments/:id retorna 500 cuando la BD falla
  test('PUT /api/payments/:id should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/payments/1').send({
      monto: 100
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error actualizando pago');

    spy.mockRestore();
  });

  // Verifica que DELETE /api/payments/:id retorna 500 cuando la BD falla
  test('DELETE /api/payments/:id should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/payments/1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error eliminando pago');

    spy.mockRestore();
  });
});