const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn'); 

// Variable ID entrenador
let createdTrainerId;

describe('Trainers API - Normal scenarios', () => {

  // ---------------------------
  // GET /api/trainers - Metodo para solicitar y recuperar datos
  // ---------------------------

  // Verifica que GET /api/trainers devuelve todos los entrenadores
  test('GET /api/trainers should return all trainers', async () => {
    // Probamos que se devuelvan todos los entrenadores
    const res = await request(app).get('/api/trainers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Validamos que sea un array
  });

  // ---------------------------
  // POST /api/trainers metodo para enviar datos al servidor
  // ---------------------------

  // Verifica que POST /api/trainers crea un entrenador
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
    expect(res.statusCode).toBe(201); 
    expect(res.body).toHaveProperty('id_entrenador');
    expect(res.body.nombre).toBe('Ana');

    // Guardamos el ID para tests de actualización/eliminación
    createdTrainerId = res.body.id_entrenador;
  });

  // Verifica que POST /api/trainers retorna 400 si faltan campos requeridos
  test('POST /api/trainers should return 400 if required fields are missing', async () => {
    const invalidTrainer = { apellido: 'Perez' }; // falta nombre y email
    const res = await request(app).post('/api/trainers').send(invalidTrainer);
    expect(res.statusCode).toBe(400); // Validación de datos incompletos
    expect(res.body).toHaveProperty('message', 'Datos del entrenador inválidos');
  });

  // ---------------------------
  // GET /api/trainers/:id 
  // ---------------------------

  // Verifica que GET /api/trainers/:id devuelve un entrenador especifico
  test('GET /api/trainers/:id should return a specific trainer', async () => {
    const res = await request(app).get(`/api/trainers/${createdTrainerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id_entrenador', createdTrainerId);
  });

  // Verifica que GET /api/trainers/:id retorna 404 si el entrenador no existe
  test('GET /api/trainers/:id should return 404 if not found', async () => {
    const res = await request(app).get('/api/trainers/999999');
    expect(res.statusCode).toBe(404); // Entrenador no existe
    expect(res.body).toHaveProperty('message', 'Entrenador no encontrado');
  });

  // ---------------------------
  // PUT /api/trainers/:id 
  // ---------------------------

  // Verifica que PUT /api/trainers/:id actualiza un entrenador
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

  // Verifica que PUT /api/trainers/:id retorna 404 si el entrenador no existe
  test('PUT /api/trainers/:id should return 404 if not found', async () => {
    const updatedTrainer = { nombre: 'No Existe', apellido: 'Test', email: 'no@test.com', telefono: '000', especialidad: 'Test', fecha_contratacion: '2024-01-01', estado: true };
    const res = await request(app).put('/api/trainers/999999').send(updatedTrainer);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Entrenador no encontrado');
  });

  // Verifica que PUT /api/trainers/:id retorna 400 si faltan datos validos para actualizar
  test('PUT /api/trainers/:id should return 400 if invalid data', async () => {
    const invalidUpdate = { telefono: '0999999999' }; // falta nombre y email
    const res = await request(app).put(`/api/trainers/${createdTrainerId}`).send(invalidUpdate);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Actualización de datos del entrenador inválida');
  });

  // ---------------------------
  // DELETE /api/trainers/:id 
  // ---------------------------

  // Verifica que DELETE /api/trainers/:id elimina un entrenador
  test('DELETE /api/trainers/:id should delete a trainer', async () => {
    const res = await request(app).delete(`/api/trainers/${createdTrainerId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Entrenador eliminado correctamente');
    expect(res.body.entrenador.id_entrenador).toBe(createdTrainerId);
  });

  // Verifica que DELETE /api/trainers/:id retorna 404 si el entrenador no existe
  test('DELETE /api/trainers/:id should return 404 if not found', async () => {
    const res = await request(app).delete('/api/trainers/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Entrenador no encontrado');
  });

  // Verifiva una ruta inexistente
  test('GET /api/gym/clients should return 404 for an unknown route', async () => {
    const res = await request(app).get('/api/gym/clients');
    expect(res.status).toBe(404); 
  });

  // Cierre de la conexión a la DB al final
  afterAll(async () => {
    await pool.end();
  });
});

// =====================
// Errors 500 - Condiciones inesperadas en el Servidor 
// =====================
describe('Trainers API - Server errors (500)', () => {

  // Verifica que GET /api/trainers retorna 500 cuando la BD falla
  test('GET /api/trainers should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/trainers');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error obteniendo entrenadores');
    spy.mockRestore();
  });

  // Verifica que GET /api/trainers/:id retorna 500 cuando la BD falla
  test('GET /api/trainers/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/trainers/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error obteniendo entrenador');
    spy.mockRestore();
  });

  // Verifica que POST /api/trainers retorna 500 cuando la BD falla
  test('POST /api/trainers should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).post('/api/trainers').send({ nombre: 'Error', apellido: 'Test', email: 'error@test.com', telefono: '000', especialidad: 'Test', fecha_contratacion: '2024-01-01' });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error creando entrenador');
    spy.mockRestore();
  });

  // Verifica que PUT /api/trainers/:id retorna 500 cuando la BD falla
  test('PUT /api/trainers/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).put('/api/trainers/1').send({ nombre: 'Error', apellido: 'Test', email: 'error@test.com', telefono: '000', especialidad: 'Test', fecha_contratacion: '2024-01-01', estado: true });
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error actualizando entrenador');
    spy.mockRestore();
  });

  // Verifica que DELETE /api/trainers/:id retorna 500 cuando la BD falla
  test('DELETE /api/trainers/:id should return 500 if DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).delete('/api/trainers/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Error eliminando entrenador');
    spy.mockRestore();
  });
});