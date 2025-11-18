const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn');

// Variables para almacenar IDs para pruebas
let createdTrainerId;
let baseClassId;
let putClassId;
let postClassId;

beforeAll(async () => {
  // Email unico para evitar conflictos
  const uniqueEmail = `trainer_${Date.now()}@test.com`;

  // Crear un entrenador para usar en las clases
  const t = await pool.query(
    `INSERT INTO entrenadores (nombre, apellido, email, telefono, especialidad, fecha_contratacion)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_entrenador`,
    ['Carlos', 'Perez', uniqueEmail, '0999001122', 'Yoga', '2024-01-01']
  );
  createdTrainerId = t.rows[0].id_entrenador;

  // Clase base para pruebas GET y PUT
  const c1 = await pool.query(
    `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador)
     VALUES ($1,$2,$3,$4,$5) RETURNING id_clase`,
    ['Yoga Base', 'Clase base', '08:00', 'Lunes', createdTrainerId]
  );
  baseClassId = c1.rows[0].id_clase;

  // Clase para pruebas PUT
  const c2 = await pool.query(
    `INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador)
     VALUES ($1,$2,$3,$4,$5) RETURNING id_clase`,
    ['Clase PUT', 'Para PUT tests', '09:00', 'Martes', createdTrainerId]
  );
  putClassId = c2.rows[0].id_clase;
});

// -------------------
// GET Tests
// -------------------
describe('GET /api/classes endpoints', () => {
  // Verifica que la ruta GET /api/classes devuelva todas las clases
  test('GET /api/classes should return all classes', async () => {
    const res = await request(app).get('/api/classes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Verifica que GET /api/classes/:id devuelva la clase correcta por su id
  test('GET /api/classes/:id should return class by id', async () => {
    const res = await request(app).get(`/api/classes/${baseClassId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id_clase', baseClassId);
  });

  // Verifica que GET /api/classes/:id con id inválido retorne 400
  test('GET /api/classes/:id with invalid id should return 400', async () => {
    const res = await request(app).get('/api/classes/abc');
    expect(res.statusCode).toBe(400);
  });

  // Verifica que GET /api/classes/:id con id inexistente retorne 404
  test('GET /api/classes/:id with non-existing class should return 404', async () => {
    const res = await request(app).get('/api/classes/999999');
    expect(res.statusCode).toBe(404);
  });
});

// -------------------
// POST Tests
// -------------------
describe('POST /api/classes endpoints', () => {
  // Verifica que POST /api/classes cree una nueva clase correctamente
  test('POST /api/classes should create a new class', async () => {
    const newClass = {
      nombre_clase: 'Yoga Nueva',
      descripcion: 'Clase basica nueva',
      horario: '09:30',
      dia_semana: 'Miercoles',
      id_entrenador: createdTrainerId
    };
    const res = await request(app).post('/api/classes').send(newClass);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id_clase');
    postClassId = res.body.id_clase;
  });

  // Verifica que POST /api/classes falle si el nombre de la clase es inválido
  test('POST /api/classes with invalid nombre_clase should return 400', async () => {
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'A', horario: '10:00', dia_semana: 'Martes' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  // Verifica que POST /api/classes falle si el horario tiene formato inválido
  test('POST /api/classes with invalid horario should return 400', async () => {
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'Spinning', horario: '99:99', dia_semana: 'Lunes' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/horario/i);
  });

  // Verifica que POST /api/classes falle si el día de la semana es inválido
  test('POST /api/classes with invalid dia_semana should return 400', async () => {
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'Crossfit', horario: '10:00', dia_semana: 'NoExiste' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/dia_semana/i);
  });

  // Verifica que POST /api/classes falle si el entrenador no existe
  test('POST /api/classes with non-existing trainer should return 400', async () => {
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'Boxeo', horario: '11:00', dia_semana: 'Viernes', id_entrenador: 999999 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Entrenador especificado no existe/);
  });

  // Verifica que POST /api/classes falle si id_entrenador no es un número válido
  test('POST /api/classes with invalid id_entrenador should return 400', async () => {
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'Pilates', horario: '09:00', dia_semana: 'Lunes', id_entrenador: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/id_entrenador invalido/);
  });
});

// -------------------
// PUT Tests
// -------------------
describe('PUT /api/classes/:id endpoints', () => {
  // Verifica que se pueda actualizar correctamente una clase existente
  test('PUT /api/classes/:id successful update', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ nombre_clase: 'Yoga Advanced', horario: '10:00', dia_semana: 'Martes' });
    expect(res.statusCode).toBe(200);
    expect(res.body.nombre_clase).toBe('Yoga Advanced');
  });

  // Verifica que retorne 400 si se proporciona un id inválido
  test('PUT /api/classes/:id invalid id should return 400', async () => {
    const res = await request(app).put('/api/classes/abc').send({});
    expect(res.statusCode).toBe(400);
  });

  // Verifica que retorne 400 si el nombre de la clase es inválido
  test('PUT /api/classes/:id invalid nombre_clase should return 400', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ nombre_clase: 'X' });
    expect(res.statusCode).toBe(400);
  });

  // Verifica que retorne 400 si no se proporcionan campos para actualizar
  test('PUT /api/classes/:id no fields to update should return 400', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({});
    expect(res.statusCode).toBe(400);
  });

  // Verifica que retorne 404 si la clase no existe
  test('PUT /api/classes/:id class not found should return 404', async () => {
    const res = await request(app).put('/api/classes/999999').send({ nombre_clase: 'Test' });
    expect(res.statusCode).toBe(404);
  });

  // Verifica que retorne 400 si el horario es inválido
  test('PUT /api/classes/:id invalid horario should return 400', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ horario: '99:99' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/horario/i);
  });

  // Verifica que retorne 400 si el día de la semana es inválido
  test('PUT /api/classes/:id invalid dia_semana should return 400', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ dia_semana: 'Doomsday' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/dia_semana/i);
  });

  test('PUT /api/classes/:id invalid id_entrenador (NaN) should return 400', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ id_entrenador: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/id_entrenador inválido/i); // ajustado acento
  });

  // Verifica que retorne 400 si el id_entrenador no existe
  test('PUT /api/classes/:id id_entrenador does not exist should return 400', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ id_entrenador: 9999, nombre_clase: 'Test' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Entrenador especificado no existe/);
  });

  // Verifica que se pueda actualizar la clase dejando id_entrenador en null
  test('PUT /api/classes/:id set id_entrenador null', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ id_entrenador: null, nombre_clase: 'Clase sin entrenador' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id_entrenador).toBeNull();
  });

  // Verifica que se pueda actualizar solo la descripción de la clase
  test('PUT /api/classes/:id partial update descripcion', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ descripcion: 'Clase avanzada de yoga' });
    expect(res.statusCode).toBe(200);
    expect(res.body.descripcion).toBe('Clase avanzada de yoga');
  });

  // Verifica que se pueda actualizar el id_entrenador y nombre de la clase correctamente
  test('PUT /api/classes/:id update id_entrenador valid', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ id_entrenador: createdTrainerId, nombre_clase: 'Clase con entrenador' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id_entrenador).toBe(createdTrainerId);
    expect(res.body.nombre_clase).toBe('Clase con entrenador');
  });

  // Verifica que se convierta correctamente un id_entrenador en string a número
  test('PUT /api/classes/:id should convert string id_entrenador to number', async () => {
    const res = await request(app).put(`/api/classes/${putClassId}`).send({ id_entrenador: String(createdTrainerId), nombre_clase: 'Clase con entrenador string' });
    expect(res.statusCode).toBe(200);
    expect(res.body.id_entrenador).toBe(createdTrainerId);
  });
});

// -------------------
// DELETE Tests
// -------------------
describe('DELETE /api/classes/:id endpoints', () => {
  // Verifica que se pueda eliminar correctamente una clase existente
  test('DELETE /api/classes/:id should delete class', async () => {
    const res = await request(app).delete(`/api/classes/${postClassId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Verifica que retorne 404 si la clase a eliminar no existe
  test('DELETE /api/classes/:id class not found should return 404', async () => {
    const res = await request(app).delete('/api/classes/999999');
    expect(res.statusCode).toBe(404);
  });

  // Verifica que retorne 400 si el id proporcionado es inválido
  test('DELETE /api/classes/:id invalid id should return 400', async () => {
    const res = await request(app).delete('/api/classes/abc');
    expect(res.statusCode).toBe(400);
  });
});

// -------------------
// Unknown route
// -------------------
describe('Unknown route', () => {
  // Verifica que cualquier ruta desconocida retorne 404
  test('GET unknown route should return 404', async () => {
    const res = await request(app).get('/api/classes/unknown/route');
    expect(res.statusCode).toBe(404);
  });
});

// -------------------
// Simulated 500 errors
// -------------------
describe('Simulated 500 errors', () => {
  let consoleSpy;

  beforeAll(() => {
    // Evita que los errores de consola se impriman durante las pruebas
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  test('GET /api/classes should return 500 on DB failure', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/classes');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Error obteniendo clases/);
    spy.mockRestore();
  });

  test('GET /api/classes/1 should return 500 on DB failure', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).get('/api/classes/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Error obteniendo clase/);
    spy.mockRestore();
  });

  test('POST /api/classes should return 500 on DB failure', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).post('/api/classes').send({ nombre_clase: 'Test', horario: '10:00', dia_semana: 'Lunes' });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Error creando clase/);
    spy.mockRestore();
  });

  test('PUT /api/classes/1 should return 500 on DB failure', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).put('/api/classes/1').send({ nombre_clase: 'Test' });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Error actualizando clase/);
    spy.mockRestore();
  });

  test('DELETE /api/classes/1 should return 500 on DB failure', async () => {
    const spy = jest.spyOn(pool, 'query').mockImplementation(() => { throw new Error('DB error'); });
    const res = await request(app).delete('/api/classes/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Error eliminando clase/);
    spy.mockRestore();
  });
});