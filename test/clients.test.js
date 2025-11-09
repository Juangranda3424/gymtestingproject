const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db/conn'); // tu pool de PostgreSQL


describe('GYM - API - CLIENTS', () => {

    //Prueba que GET deberia devolver una lista predefinida con clientes inicialmente es para la prueba inicial cuando se ejectuta por primera vez el test
    test('GET should return a predefined list of clients initially; this is for the initial test when the test is first run', 
        async () =>{
            const res = await request(app).get('/api/clients');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([
                {
                    id_cliente: 1,
                    nombre: "Juan",
                    apellido: "Granda",
                    fecha_nacimiento: "1990-05-10",
                    email: "juan@email.com",
                    telefono: "0991234567",
                    estado: true,
                    fecha_nacimiento: "1990-05-10T05:00:00.000Z",
                    fecha_registro: "2025-11-08T21:59:33.259Z"
                },
                {
                    id_cliente: 2,
                    nombre: "Maria",
                    apellido: "Lopez",
                    fecha_nacimiento: "1995-08-20",
                    email: "maria@email.com",
                    telefono: "0987654321",
                    estado: true,
                    fecha_nacimiento: "1995-08-20T05:00:00.000Z",
                    fecha_registro: "2025-11-08T21:59:33.259Z",
                }]);
    });

    //Prueba con POST deberia crear correctamente el usuario 

    test('POST should correctly create the user', async () => {

        const newClient = { name: 'Luis', email: 'luis@ejemplo.com', lastname: 'Castillo', birthdate: '1990-05-10', cell: '0987271121'};

        const res = await request(app).post('/api/clients').send(newClient);

        expect(res.statusCode).toBe(201);
        expect(res.body.nombre).toBe('Luis')

    });

    //Prueba con POST deberia no crear correctamente el usuario 

    test('POST should not create the user correctly', async () => {

        const newClient = { email: 'luis@ejemplo.com', lastname: 'Castillo', birthdate: '1990-05-10', cell: '0987271121'};

        const res = await request(app).post('/api/clients').send(newClient);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Faltan datos del cliente');


    });

    //Prueba con POST no debería crear el usuario por que ya existe    
    test('POST should not create the user because it already exists.', async () => {

        const newClient = { name: 'Luis', email: 'luis@ejemplo.com', lastname: 'Castillo', birthdate: '1990-05-10', cell: '0987271121'};

        const res = await request(app).post('/api/clients').send(newClient);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'El cliente ya existe');


    });


    //Prueba con PUT deberia actualizar correctamente el usuario

    test('PUT should update the user correctly', async () => {

        const updateClient = { name: 'Carlos', email: 'carlos@ejemplo.com', lastname: 'Castillo', cell: '0987271121'};

        //Cambiar el pathparam segun la necesidad
        const res = await request(app).put('/api/clients/3').send(updateClient);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('nombre');
        expect(res.body.nombre).toBe('Carlos')

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
        expect(res.body).toHaveProperty('message', 'Actualización de datos del cliente invalida');
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


    test('POST /api/clients should return 500 if db fails', async () => {
        const spy = jest.spyOn(pool, 'query').mockImplementation(() => {
            throw new Error('DB error');
        });

        const newClient = { 
            name: 'Test', 
            lastname: 'User', 
            birthdate: '2000-01-01', 
            email: 'test@user.com', 
            cell: '0999999999' 
        };

        const res = await request(app).post('/api/clients').send(newClient);

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
            email: 'updated@user.com', 
            cell: '0998888888' 
        };

        const res = await request(app).put('/api/clients/1').send(updateClient);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error al actualizar el cliente');

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