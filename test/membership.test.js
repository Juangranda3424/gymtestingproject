const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn');

describe('GYM - API - MEMBERSHIPS', () => {

    // GET → debería devolver lista de membresías
    test('GET /api/memberships should return list of memberships', async () => {
        const res = await request(app).get('/api/memberships');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // POST → debería crear una membresía exitosamente
    test('POST /api/memberships should create a membership successfully', async () => {

        const tipo = `test_${Date.now()}-test`;

        const newMembership = {
            tipo: tipo,
            precio: 20.50,
            duracion_meses: 1
        };

        const res = await request(app)
            .post('/api/memberships')
            .send(newMembership);

        expect(res.status).toBe(201);
    });

    // POST → debería fallar por datos faltantes
    test('POST /api/memberships should return 400 for missing data', async () => {

        const newMembership = { precio: 10.50 };

        const res = await request(app)
            .post('/api/memberships')
            .send(newMembership);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Faltan datos de la membresía');
    });

    // PUT → debería actualizar una membresía existente
    test('PUT /api/memberships/:id should update a membership', async () => {
        const updateMembership = { tipo: "anual", precio: 99.99, duracion_meses: 12 };

        const res = await request(app)
            .put('/api/memberships/3')
            .send(updateMembership);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('tipo', 'anual');
    });

    // PUT → debería retornar 404 si la membresía no existe
    test('PUT /api/memberships/:id should return 404 if not found', async () => {
        const updateMembership = { tipo: "mensual", precio: 30, duracion_meses: 1 };

        const res = await request(app)
            .put('/api/memberships/999999')
            .send(updateMembership);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Membresía no encontrada');
    });

    // PUT → debería detectar actualización inválida
    test('PUT /api/memberships/:id should return 400 for invalid update', async () => {
        const res = await request(app)
            .put('/api/memberships/1')
            .send({});

        expect(res.status).toBe(400);
    });

    // DELETE → debería retornar 404 si no existe
    test('DELETE /api/memberships/:id should return 404 if membership does not exist', async () => {
        const res = await request(app).delete('/api/memberships/999999');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Membresía no encontrada');
    });

    // Ruta inexistente
    test('GET /api/gym/memberships should return 404 for unknown route', async () => {
        const res = await request(app).get('/api/gym/memberships');
        expect(res.status).toBe(404);
    });

    afterAll(async () => {
        await pool.end(); // cerrar conexiones
    });
});


/* --------------------------
   TESTS DE ERROR 500
---------------------------- */

describe('GYM - API ERROR 500 - MEMBERSHIPS', () => {

    test('GET /api/memberships should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const res = await request(app).get('/api/memberships');

        expect(res.status).toBe(500);
        spy.mockRestore();
    });

    test('POST /api/memberships should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockRejectedValue(new Error('DB error'));

        const newMembership = {
            tipo: "semestral",
            precio: 50.00,
            duracion_meses: 6
        };

        const res = await request(app).post('/api/memberships').send(newMembership);

        expect(res.status).toBe(500);
        spy.mockRestore();
    });

    test('PUT /api/memberships/:id should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const updateMembership = {
            tipo: "mensual",
            precio: 20.00,
            duracion_meses: 1
        };

        const res = await request(app).put('/api/memberships/10').send(updateMembership);

        expect(res.status).toBe(500);

        spy.mockRestore();
    });

    test('DELETE /api/memberships/:id should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const res = await request(app).delete('/api/memberships/1');

        expect(res.status).toBe(500);
        spy.mockRestore();
    });

});
