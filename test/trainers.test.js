const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn'); 

let createdTrainerId;

// ======================================================
// Bloque principal: tests normales de la API
// ======================================================
describe('Trainers API - Normal scenarios', () => {

  // ---------------------------
  // GET /api/trainers - todos los entrenadores
  // ---------------------------
  test('GET /api/trainers should return all trainers', async () => {
    // Probamos que se devuelvan todos los entrenadores
    const res = await request(app).get('/api/trainers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Validamos que sea un array
  });

  // ---------------------------
  // POST /api/trainers - crear entrenador
  // ---------------------------
  test('POST /api/trainers should create a trainer', async () => {
    const uniqueEmail = `ana_${Date.now()}@test.com`; // email único cada vez que corre el test

    const newTrainer = {
      nombre: 'Ana',
      apellido: 'Gomez',
      email: uniqueEmail,
      telefono: '099998877',
      especialidad: 'Pilates',
      fecha_contratacion: '2024-01-10'
    };

    const res = await request(app).post('/api/trainers').send(newTrainer);
    expect(res.statusCode).toBe(201); // Código 201 para creación exitosa
    expect(res.body).toHaveProperty('id_entrenador');
    expect(res.body.nombre).toBe('Ana');

    // Guardamos el ID para tests de actualización/eliminación
    createdTrainerId = res.body.id_entrenador;
  });

  test('POST /api/trainers should return 400 if required fields are missing', async () => {
    const invalidTrainer = { apellido: 'Perez' }; // falta nombre y email
    const res = await request(app).post('/api/trainers').send(invalidTrainer);
    expect(res.statusCode).toBe(400); // Validación de datos incompletos
    expect(res.body).toHaveProperty('message', 'Datos del entrenador inválidos');
  });

  // ---------------------------
  // GET /api/trainers/:id - entrenador específico
  // ---------------------------
  test('GET /api/trainers/:id should return a specific trainer', async () => {
    const res = await request(app).get(`/api/trainers/${createdTrainerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id_entrenador', createdTrainerId);
  });

  test('GET /api/trainers/:id should return 404 if not found', async () => {
    const res = await request(app).get('/api/trainers/999999');
    expect(res.statusCode).toBe(404); // Entrenador no existe
    expect(res.body).toHaveProperty('message', 'Entrenador no encontrado');
  });

  // ---------------------------
  // PUT /api/trainers/:id - actualizar entrenador
  // ---------------------------
  test('PUT /api/trainers/:id should update a trainer', async () => {
    const uniqueEmail = `ana_${Date.now()}@test.com`;

    const updatedTrainer = {
      nombre: 'Ana Actualizada',
      apellido: 'Gomez',
      email: uniqueEmail,
      telefono: '099998877',
      especialidad: 'Yoga',
      fecha_contratacion: '2024-01-10',
      estado: true
    };

    const res = await request(app).put(`/api/trainers/${createdTrainerId}`).send(updatedTrainer);
    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('Ana Actualizada');
    expect(res.body.especialidad).toBe('Yoga');
  });

  test('PUT /api/trainers/:id should return 404 if not found', async () => {
    const updatedTrainer = { nombre: 'No Existe', apellido: 'Test', email: 'no@test.com', telefono: '000', especialidad: 'Test', fecha_contratacion: '2024-01-01', estado: true };
    const res = await request(app).put('/api/trainers/999999').send(updatedTrainer);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Entrenador no encontrado');
  });

  test('PUT /api/trainers/:id should return 400 if invalid data', async () => {
    const invalidUpdate = { telefono: '0999999999' }; // falta nombre y email
    const res = await request(app).put(`/api/trainers/${createdTrainerId}`).send(invalidUpdate);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Actualización de datos del entrenador inválida');
  });

  // ---------------------------
  // DELETE /api/trainers/:id - eliminar entrenador
  // ---------------------------
  test('DELETE /api/trainers/:id should delete a trainer', async () => {
    const res = await request(app).delete(`/api/trainers/${createdTrainerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Entrenador eliminado correctamente');
    expect(res.body.entrenador.id_entrenador).toBe(createdTrainerId);
  });

  test('DELETE /api/trainers/:id should return 404 if not found', async () => {
    const res = await request(app).delete('/api/trainers/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Entrenador no encontrado');
  });

  // ---------------------------
  // Ruta inexistente
  // ---------------------------
  test('GET /api/gym/clients should return 404 for an unknown route', async () => {
    const res = await request(app).get('/api/gym/clients');
    expect(res.status).toBe(404); // Ruta no existente
  });

});

// ======================================================
// Bloque separado: tests de errores 500
// ======================================================
describe('Trainers API - Server errors (500)', () => {
  let consoleSpy;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  test('GET /api/trainers should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/trainers');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error obteniendo entrenadores');
    spy.mockRestore();
  });

  test('GET /api/trainers/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/trainers/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error obteniendo entrenador');
    spy.mockRestore();
  });

  test('POST /api/trainers should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).post('/api/trainers').send({ nombre: 'Error', apellido: 'Test', email: 'error@test.com', telefono: '000', especialidad: 'Test', fecha_contratacion: '2024-01-01' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error creando entrenador');
    spy.mockRestore();
  });

  test('PUT /api/trainers/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).put('/api/trainers/1').send({ nombre: 'Error', apellido: 'Test', email: 'error@test.com', telefono: '000', especialidad: 'Test', fecha_contratacion: '2024-01-01', estado: true });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error actualizando entrenador');
    spy.mockRestore();
  });

  test('DELETE /api/trainers/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).delete('/api/trainers/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error eliminando entrenador');
    spy.mockRestore();
  });

  // Cierre de la conexión a la DB al final
  afterAll(async () => {
    await pool.end();
  });
});
