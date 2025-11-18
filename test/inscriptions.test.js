const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn');

// Variables para IDs generados en pruebas 
let createdClientId;
let createdClassId;
let createdInscriptionId;

describe('GYM - API - INSCRIPTIONS', () => {

  // crear cliente y clase antes de las pruebas
  beforeAll(async () => {
    const clientRes = await pool.query(
      `INSERT INTO clientes (nombre, apellido, email, telefono)
       VALUES ($1,$2,$3,$4) RETURNING id_cliente`,
      ['Test', 'Client', `test_client_${Date.now()}@mail.com`, '0999001122']
    );
    createdClientId = clientRes.rows[0].id_cliente;

    const classRes = await pool.query(
      `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana)
       VALUES ($1,$2,$3,$4) RETURNING id_clase`,
      ['Test Class', 'Test description', '12:00', 'Monday']
    );
    createdClassId = classRes.rows[0].id_clase;
  });

  // ---------------------------
  // GET /api/inscriptions
  // ---------------------------

  // Verifica que GET /api/inscriptions retorna todas las inscripciones
  test('GET /api/inscriptions should return all inscriptions', async () => {
    const res = await request(app).get('/api/inscriptions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ---------------------------
  // POST /api/inscriptions 
  // ---------------------------
  
  // Verifica que POST /api/inscriptions crea una nueva inscripcion
  test('POST /api/inscriptions should create a new inscription', async () => {
    const res = await request(app).post('/api/inscriptions').send({
      id_cliente: createdClientId,
      id_clase: createdClassId
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id_inscripcion');
    createdInscriptionId = res.body.id_inscripcion;
  });

  // Verifica que POST /api/inscriptions retorna 400 si faltan campos requeridos
  test('POST /api/inscriptions should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/inscriptions').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'id_cliente e id_clase son requeridos');
  });

  // Verifica que POST /api/inscriptions retorna 400 si el cliente o la clase no existen
  test('POST /api/inscriptions should return 400 if client or class does not exist', async () => {
    let res = await request(app).post('/api/inscriptions').send({ id_cliente: 99999, id_clase: createdClassId });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cliente no existe');
    res = await request(app).post('/api/inscriptions').send({ id_cliente: createdClientId, id_clase: 99999 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Clase no existe');
  });

  // ---------------------------
  // GET /api/inscriptions/:id 
  // ---------------------------

  // Verifica que GET /api/inscriptions/:id retorna una inscripcion especifica
  test('GET /api/inscriptions/:id should return a specific inscription', async () => {
    const res = await request(app).get(`/api/inscriptions/${createdInscriptionId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id_inscripcion', createdInscriptionId);
  });

  // Verifica que GET /api/inscriptions/:id retorna 404 si la inscripcion no existe
  test('GET /api/inscriptions/:id should return 404 if not found', async () => {
    const res = await request(app).get('/api/inscriptions/999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Inscripción no encontrada');
  });

  // Verifica que GET /api/inscriptions/:id retorna 400 si el id no es un numero
  test('GET /api/inscriptions/:id should return 400 if id is not a number', async () => {
    const res = await request(app).get('/api/inscriptions/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'ID inválido');
  });

  // ---------------------------
  // PUT /api/inscriptions/:id 
  // ---------------------------

  // Verifica que PUT /api/inscriptions/:id actualiza la clase de una inscripcion
  test('PUT /api/inscriptions/:id should update class', async () => {
    const newClass = await pool.query(
      `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana)
       VALUES ($1,$2,$3,$4) RETURNING id_clase`,
      ['New Class', 'Description', '13:00', 'Tuesday']
    );
    const newClassId = newClass.rows[0].id_clase;
    const res = await request(app).put(`/api/inscriptions/${createdInscriptionId}`).send({ id_clase: newClassId });
    expect(res.status).toBe(200);
    expect(res.body.id_clase).toBe(newClassId);
    await pool.query('DELETE FROM clases WHERE id_clase=$1', [newClassId]);
  });

  // Verifica que PUT /api/inscriptions/:id retorna 404 si la inscripcion no existe
  test('PUT /api/inscriptions/:id should return 404 if not found', async () => {
    const res = await request(app).put('/api/inscriptions/999999').send({ id_clase: createdClassId });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Inscripción no encontrada');
  });

  // Verifica que PUT /api/inscriptions/:id retorna 400 si id_clase no es enviado
  test('PUT /api/inscriptions/:id should return 400 if id_clase is missing', async () => {
    const tempRes = await request(app).post('/api/inscriptions').send({
      id_cliente: createdClientId,
      id_clase: createdClassId
    });
    const tempId = tempRes.body.id_inscripcion;
    const res = await request(app).put(`/api/inscriptions/${tempId}`).send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'id_clase es requerido');
    await request(app).delete(`/api/inscriptions/${tempId}`);
  });

  // Verifica que PUT /api/inscriptions/:id retorna 400 si la nueva clase no existe
  test('PUT /api/inscriptions/:id should return 400 if class does not exist', async () => {
    const res = await request(app).put(`/api/inscriptions/${createdInscriptionId}`).send({ id_clase: 99999 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Clase no existe');
  });

  // Verifica que PUT /api/inscriptions/:id retorna 400 si el id no es un numero
  test('PUT /api/inscriptions/:id should return 400 if id is not a number', async () => {
    const res = await request(app).put('/api/inscriptions/abc').send({ id_clase: createdClassId });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'ID inválido');
  });

  // ---------------------------
  // DELETE /api/inscriptions/:id
  // ---------------------------

  // Verifica que DELETE /api/inscriptions/:id elimina una inscripcion
  test('DELETE /api/inscriptions/:id should delete an inscription', async () => {
    const createRes = await request(app).post('/api/inscriptions').send({
      id_cliente: createdClientId,
      id_clase: createdClassId
    });
    const tempId = createRes.body.id_inscripcion;
    const res = await request(app).delete(`/api/inscriptions/${tempId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Inscripción eliminada');
  });

  // Verifica que DELETE /api/inscriptions/:id retorna 404 si la inscripcion no existe
  test('DELETE /api/inscriptions/:id should return 404 if not found', async () => {
    const res = await request(app).delete('/api/inscriptions/999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Inscripción no encontrada');
  });

  // Verifica que DELETE /api/inscriptions/:id retorna 400 si el id es invalido
  test('DELETE /api/inscriptions/:id should return 400 for invalid id', async () => {
    const res = await request(app).delete('/api/inscriptions/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'ID inválido');
  });

  afterAll(async () => {
    await pool.end();
  });

});

describe('GYM - API - INSCRIPTIONS ERROR 500', () => {

  // Verifica que GET /api/inscriptions retorna 500 si la BD falla
  test('GET /api/inscriptions should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/inscriptions');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error obteniendo inscripciones');
    spy.mockRestore();
  });

  // Verifica que GET /api/inscriptions/:id retorna 500 si la BD falla
  test('GET /api/inscriptions/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/inscriptions/1');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error obteniendo inscripción');
    spy.mockRestore();
  });

  // Verifica que POST /api/inscriptions retorna 500 si la BD falla
  test('POST /api/inscriptions should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).post('/api/inscriptions').send({ id_cliente: createdClientId, id_clase: createdClassId });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error creando inscripción');
    spy.mockRestore();
  });

  // Verifica que PUT /api/inscriptions/:id retorna 500 si la BD falla
  test('PUT /api/inscriptions/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).put('/api/inscriptions/1').send({ id_clase: createdClassId });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error actualizando inscripción');
    spy.mockRestore();
  });

  // Verifica que DELETE /api/inscriptions/:id retorna 500 si la BD falla
  test('DELETE /api/inscriptions/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).delete('/api/inscriptions/1');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error eliminando inscripción');
    spy.mockRestore();
  });
});