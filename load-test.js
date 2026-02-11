import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del test
export let options = {
    stages: [
        { duration: '10s', target: 50 },  // Calentamiento
        { duration: '30s', target: 100 }, // Carga sostenida
        { duration: '10s', target: 0 }    // Enfriamiento
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% de peticiones < 500ms
        http_req_failed: ['rate<0.01']    // <1% de fallos
    }
};

const BASE_URL = 'http://localhost:3000/api';

// Función para generar emails únicos por iteración
function uniqueEmail(base) {
    return base.replace('@', `+${Date.now()}@`);
}

// Función principal
export default function () {
    // ===================== CLIENTES =====================
    const clientData = {
        name: 'Juan',
        lastname: 'Pérez',
        birthdate: '1990-05-15',
        email: uniqueEmail('juan.perez@email.com'),
        cell: '0991234567'
    };

    let res = http.get(`${BASE_URL}/clients`);
    check(res, { 'GET /clients status 200': (r) => r.status === 200 });

    res = http.post(`${BASE_URL}/clients`, JSON.stringify(clientData), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'POST /clients status 201': (r) => r.status === 201 });
    sleep(0.5);

    // ===================== ENTRENADORES =====================
    const trainerData = {
        nombre: 'María',
        apellido: 'González',
        email: uniqueEmail('maria.gonzalez@gym.com'),
        telefono: '0987654321',
        especialidad: 'Yoga',
        fecha_contratacion: '2024-01-10'
    };

    res = http.get(`${BASE_URL}/trainers`);
    check(res, { 'GET /trainers status 200': (r) => r.status === 200 });

    res = http.post(`${BASE_URL}/trainers`, JSON.stringify(trainerData), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'POST /trainers status 201': (r) => r.status === 201 });
    sleep(0.5);

    // ===================== CLASES =====================
    const classData = {
        nombre_clase: 'Yoga',
        descripcion: 'Clase de relajación y estiramiento',
        horario: '18:00',
        dia_semana: 'Lunes',
        id_entrenador: null
    };

    res = http.get(`${BASE_URL}/classes`);
    check(res, { 'GET /classes status 200': (r) => r.status === 200 });

    res = http.post(`${BASE_URL}/classes`, JSON.stringify(classData), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'POST /classes status 201': (r) => r.status === 201 });
    sleep(0.5);

    // ===================== MEMBRESÍAS =====================
    const membershipData = {
        tipo: `Mensual_${Math.floor(Math.random() * 100000)}`,
        precio: 2500.00,
        duracion_meses: 1
    };

    res = http.get(`${BASE_URL}/memberships`);
    check(res, { 'GET /memberships status 200': (r) => r.status === 200 });

    res = http.post(`${BASE_URL}/memberships`, JSON.stringify(membershipData), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'POST /memberships status 201': (r) => r.status === 201 });
    sleep(0.5);

    // ===================== INSCRIPCIONES =====================
    const inscriptionData = {
        id_cliente: 1,
        id_clase: 1
    };

    res = http.get(`${BASE_URL}/inscriptions`);
    check(res, { 'GET /inscriptions status 200': (r) => r.status === 200 });

    res = http.post(`${BASE_URL}/inscriptions`, JSON.stringify(inscriptionData), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'POST /inscriptions status 201': (r) => r.status === 201 });
    sleep(0.5);

    // ===================== PAGOS =====================
    const paymentData = {
        id_cliente: 1,
        id_membresia: 1,
        monto: 2500.00
    };

    res = http.get(`${BASE_URL}/payments`);
    check(res, { 'GET /payments status 200': (r) => r.status === 200 });

    res = http.post(`${BASE_URL}/payments`, JSON.stringify(paymentData), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, { 'POST /payments status 201': (r) => r.status === 201 });

    sleep(1);
}