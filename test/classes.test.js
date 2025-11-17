// test/classes.test.js
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn');

let createdTrainerId;
let createdClassId;
let classIdForPut;

/*
  Comentarios en español; descripciones/tests en inglés.
  - beforeAll: crea trainer y una clase inicial.
  - afterAll: limpia datos creados y cierra pool.
*/

describe('Classes API - Normal scenarios', () => {
  // Crear recursos base
  beforeAll(async () => {
    // trainer con email único para evitar conflicto UNIQUE
    const uniqueEmail = `trainer_${Date.now()}@test.com`;

    const t = await pool.query(
      `INSERT INTO entrenadores (nombre, apellido, email, telefono, especialidad, fecha_contratacion)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_entrenador`,
      ['Carlos', 'Perez', uniqueEmail, '0999001122', 'Yoga', '2024-01-01']
    );
    createdTrainerId = t.rows[0].id_entrenador;

    // crear una clase base para GET ALL / GET by id / DELETE
    const c = await pool.query(
      `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador)
       VALUES ($1,$2,$3,$4,$5) RETURNING id_clase`,
      ['Yoga Base', 'Clase base', '08:00', 'Lunes', createdTrainerId]
    );
    createdClassId = c.rows[0].id_clase;

    // crear otra clase que usaremos en PUT tests (para cubrir ramas de update)
    const c2 = await pool.query(
      `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador)
       VALUES ($1,$2,$3,$4,$5) RETURNING id_clase`,
      ['Clase PUT', 'Para PUT tests', '09:00', 'Martes', createdTrainerId]
    );
    classIdForPut = c2.rows[0].id_clase;
  });

  // ---------------------------
  // GET ALL
  // ---------------------------
  test('GET /api/classes should return all classes', async () => {
    const res = await request(app).get('/api/classes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ---------------------------
  // POST create class (happy path)
  // ---------------------------
  test('POST /api/classes should create a new class', async () => {
    const newClass = {
      nombre_clase: 'Yoga Nueva',
      descripcion: 'Clase básica nueva',
      horario: '09:30',
      dia_semana: 'Miércoles',
      id_entrenador: createdTrainerId
    };

    const res = await request(app).post('/api/classes').send(newClass);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id_clase');
    // guardamos y luego eliminamos en afterAll
    // si no existe la propiedad, el test falla y no rompe la suite
    createdClassId = res.body.id_clase;
  });

  // ---------------------------
  // POST validations (400 cases)
  // ---------------------------
  test('POST /api/classes should return 400 for invalid nombre_clase', async () => {
    const invalid = { nombre_clase: 'A', horario: '10:00', dia_semana: 'Martes' };
    const res = await request(app).post('/api/classes').send(invalid);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/classes should return 400 for invalid horario format', async () => {
    const invalid = { nombre_clase: 'Spinning', horario: '99:99', dia_semana: 'Lunes' };
    const res = await request(app).post('/api/classes').send(invalid);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/horario/i);
  });

  test('POST /api/classes should return 400 for invalid dia_semana', async () => {
    const invalid = { nombre_clase: 'Crossfit', horario: '10:00', dia_semana: 'NoExiste' };
    const res = await request(app).post('/api/classes').send(invalid);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/dia_semana/i);
  });

  test('POST /api/classes should return 400 if trainer does not exist', async () => {
    const invalid = {
      nombre_clase: 'Boxeo',
      horario: '11:00',
      dia_semana: 'Viernes',
      id_entrenador: 999999
    };
    const res = await request(app).post('/api/classes').send(invalid);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Entrenador especificado no existe');
  });

  test('POST /api/classes should return 400 for invalid id_entrenador (NaN)', async () => {
    const res = await request(app).post('/api/classes').send({
      nombre_clase: 'Pilates',
      horario: '09:00',
      dia_semana: 'Lunes',
      id_entrenador: 'abc'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('id_entrenador inválido');
  });

  // ---------------------------
  // GET by ID
  // ---------------------------
  test('GET /api/classes/:id should return class by id', async () => {
    const res = await request(app).get(`/api/classes/${createdClassId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id_clase', createdClassId);
  });

  test('GET /api/classes/:id should return 400 for invalid id', async () => {
    const res = await request(app).get('/api/classes/abc');
    expect(res.status).toBe(400);
  });

  test('GET /api/classes/:id should return 404 if class not found', async () => {
    const res = await request(app).get('/api/classes/999999');
    expect(res.status).toBe(404);
  });

  // ---------------------------
  // PUT update class
  // ---------------------------
  test('PUT /api/classes/:id should update class', async () => {
    const updatedData = { nombre_clase: 'Yoga Advanced', horario: '10:00', dia_semana: 'Martes' };
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send(updatedData);
    expect(res.status).toBe(200);
    expect(res.body.nombre_clase).toBe('Yoga Advanced');
  });

  test('PUT /api/classes/:id should return 400 for invalid id', async () => {
    const res = await request(app).put('/api/classes/abc').send({});
    expect(res.status).toBe(400);
  });

  test('PUT /api/classes/:id should return 400 if invalid nombre_clase', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({ nombre_clase: 'X' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/classes/:id should return 400 if no fields to update', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({});
    expect(res.status).toBe(400);
  });

  test('PUT /api/classes/:id should return 404 if class not found', async () => {
    const res = await request(app).put('/api/classes/999999').send({ nombre_clase: 'Test' });
    expect(res.status).toBe(404);
  });

  // Validaciones PUT específicas (horario/dia/id_entrenador)
  test('PUT /api/classes/:id should return 400 for invalid horario', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({ horario: '99:99' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/horario/i);
  });

  test('PUT /api/classes/:id should return 400 for invalid dia_semana', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({ dia_semana: 'Doomsday' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/dia_semana/i);
  });

  test('PUT /api/classes/:id should return 400 for invalid id_entrenador (NaN)', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({ id_entrenador: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('id_entrenador inválido');
  });

  test('PUT /api/classes/:id should return 400 if id_entrenador does not exist', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({
      id_entrenador: 9999,
      nombre_clase: 'Test' // forzar update query
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Entrenador especificado no existe');
  });

  test('PUT /api/classes/:id should set id_entrenador to null when id_entrenador is null', async () => {
    const res = await request(app).put(`/api/classes/${classIdForPut}`).send({
      id_entrenador: null,
      nombre_clase: 'Clase sin entrenador'
    });
    expect(res.status).toBe(200);
    expect(res.body.id_entrenador).toBeNull();
  });

  // ---------------------------
  // DELETE class
  // ---------------------------
  test('DELETE /api/classes/:id should delete class', async () => {
    const res = await request(app).delete(`/api/classes/${createdClassId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /api/classes/:id should return 404 if not found', async () => {
    const res = await request(app).delete('/api/classes/999999');
    expect(res.status).toBe(404);
  });

  test('DELETE /api/classes/:id should return 400 for invalid id', async () => {
    const res = await request(app).delete('/api/classes/abc');
    expect(res.status).toBe(400);
  });

  test('GET unknown route should return 404', async () => {
    const res = await request(app).get('/api/classes/unknown/route');
    expect(res.status).toBe(404);
  });
});


// ======================================================
// Bloque 500 - Errores forzados del servidor
// ======================================================
describe('Classes API - Server errors (500)', () => {
  let consoleSpy;

  beforeAll(() => {
    // silenciar console.error para que no ensucie la salida de tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  test('GET /api/classes should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/classes');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error obteniendo clases/);
    spy.mockRestore();
  });

  test('GET /api/classes/:id should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/classes/1');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error obteniendo clase/);
    spy.mockRestore();
  });

  test('POST /api/classes should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'Test', horario: '10:00', dia_semana: 'Lunes' });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error creando clase/);
    spy.mockRestore();
  });

  test('PUT /api/classes/:id should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).put('/api/classes/1').send({ nombre_clase: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error actualizando clase/);
    spy.mockRestore();
  });

  test('DELETE /api/classes/:id should return 500 when DB fails', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).delete('/api/classes/1');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Error eliminando clase/);
    spy.mockRestore();
  });

  // limpiar y cerrar pool
  afterAll(async () => {
    try {
      // eliminar las clases creadas por los tests si quedan
      if (classIdForPut) await pool.query('DELETE FROM clases WHERE id_clase=$1', [classIdForPut]);
      if (createdClassId) await pool.query('DELETE FROM clases WHERE id_clase=$1', [createdClassId]);
      if (createdTrainerId) await pool.query('DELETE FROM entrenadores WHERE id_entrenador=$1', [createdTrainerId]);
    } catch (e) {
      // no romper en caso de fallo de limpieza
    } finally {
      await pool.end();
    }
  });
});