const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn'); // tu pool de PostgreSQL


describe('GYM - API - CLIENTS', () => {

    //Prueba que GET deberia devolver una lista predefinida con clientes inicialmente es para la prueba inicial cuando se ejectuta por primera vez el test
    test('GET should return a predefined list of clients initially; this is for the initial test when the test is first run', 
        async () =>{
            const res = await request(app).get('/api/clients');
            expect(res.statusCode).toBe(200);
    });

    //Prueba con POST deberia no crear correctamente el usuario por que ya existe en la base de datos 

    test('POST should not create the user in BS', async () => {

        const newClient = { name: 'Luis', email: 'juan@email.com', lastname: 'Castillo', birthdate: '1990-05-10', cell: '0987271121'};

        const res = await request(app).post('/api/clients').send(newClient);

        //Si existe me responde con el 409
        expect(res.statusCode).toBe(409);

    });

    //POST cdeberia crear un cliente correctamente en la base de datos
    test('POST /api/clients should create a client successfully', async () => {

        // Generar un email único por test basado en timestamp
        const uniqueEmail = `test_${Date.now()}@example.com`;

        const newClient = {
            name: 'Juan',
            lastname: 'Perez',
            birthdate: '1995-05-10',
            email: uniqueEmail,
            cell: '0991112223'
        };

        const res = await request(app)
            .post('/api/clients')
            .send(newClient);
        // Asserts
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id_cliente');
        expect(res.body).toHaveProperty('nombre', 'Juan');
        expect(res.body).toHaveProperty('apellido', 'Perez');
        expect(res.body).toHaveProperty('email', uniqueEmail);
    });



    //Prueba con POST deberia no crear correctamente el usuario 

    test('POST should not create the user correctly', async () => {

        const newClient = { email: 'luis@ejemplo.com', lastname: 'Castillo', birthdate: '1990-05-10', cell: '0987271121'};

        const res = await request(app).post('/api/clients').send(newClient);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Faltan datos del cliente');


    });

    //Prueba con PUT deberia actualizar correctamente el usuario
    test('PUT should update the user correctly', async () => {

        const updateClient = { name: 'Carlos', lastname: 'Castillo', cell: '0987271121'};

        //Cambiar el pathparam segun la necesidad
        const res = await request(app).put('/api/clients/1').send(updateClient);
        expect(res.status).toBe(200);
    });

    //Prueba con PUT debería devolver 404 si la cliente no existe

    test('PUT should return 404 if client does not exist', async () => {
        const updateClient = { name: 'Ana', email: 'ana@ejemplo.com', lastname: 'Perez', cell: '0999999999'};
        const res = await request(app).put('/api/clients/9999').send(updateClient);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Cliente no encontrado');
    });


    //Prueba con PUT debería devolver un código 400 si no es válida    
    test('PUT should return 400 for invalid request', async () => {
        const updateClient = {};
        const res = await request(app).put('/api/clients/1').send(updateClient);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Actualización de datos del cliente inválida');
    });

    //Prueba con DELETE deberia eliminar correctamente el usuario

    test('DELETE should update the user correctly', async () => {

        //Cambiar el pathparam segun la necesidad
        const res = await request(app).delete('/api/clients/5');

        expect(res.status).toBe(200);
        //El numero al que iguala es al pathparam
        expect(res.body.id_cliente).toEqual(5);
    });

    //Prueba con DELETE debería devolver 404 si la cliente no existe

    test('DELETE should return 404 if client does not exist', async () => {
        const res = await request(app).delete('/api/clients/9999');

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Cliente no encontrado en la base de datos');
    });

    //Prueba con GET a una ruta inexistente a la API REST
    test('GET /api/gym/clients should return 404 for an unknown route', async () => {
        const res = await request(app).get('/api/gym/clients');
        expect(res.status).toBe(404);
    });


    afterAll(async () => {
        await pool.end(); // cierra todas las conexiones abiertas
    });

});

describe('GYM - API ERROR 500', () => {

    //Error 500 simulando un fallo en el servidor
    
    test('GET /api/clients should return 500 if db fails', async () => {
        // Simulamos un error de la base de datos
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const res = await request(app).get('/api/clients');

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error al obtener los clientes');

        // Restauramos la función original
        spy.mockRestore();
    });


    //Prueba: debe retornar 500 si la base de datos falla
    test('POST /api/clients should return 500 if database fails', async () => {

        // Simula un error de BD
        const spy = jest.spyOn(pool, 'query').mockRejectedValue(new Error('DB error'));

        const newClient = {
            name: 'Pedro',
            lastname: 'Gomez',
            birthdate: '1990-10-10',
            email: 'pedro@fail.com',
            cell: '0999999999'
        };

        const res = await request(app)
            .post('/api/clients')
            .send(newClient);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error al crear el cliente');

        spy.mockRestore();
    });


    test('PUT /api/clients/:id should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const updateClient = { 
            name: 'Updated', 
            lastname: 'User', 
            email: 'carlos@example.com', 
            cell: '0998888888' 
        };

        const res = await request(app).put('/api/clients/100000').send(updateClient);

        expect(res.status).toBe(500);

        spy.mockRestore();
    });

    test('DELETE /api/clients/:id should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const res = await request(app).delete('/api/clients/1');

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error al eliminar el cliente');

        spy.mockRestore();
    });

});