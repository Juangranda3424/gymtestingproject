
-- ESQUEMA DE BASE DE DATOS PARA GIMNASIO
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE -- activo/inactivo
);
-- Tabla de entrenadores
CREATE TABLE entrenadores (
    id_entrenador SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    especialidad VARCHAR(50),
    fecha_contratacion DATE,
    estado BOOLEAN DEFAULT TRUE -- activo/inactivo
);
-- Tabla de membresías
CREATE TABLE membresias (
    id_membresia SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- mensual, trimestral, anual
    precio DECIMAL(10,2) NOT NULL,
    duracion_meses INT NOT NULL
);
-- Tabla de pagos
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    id_membresia INT REFERENCES membresias(id_membresia) ON DELETE CASCADE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10,2) NOT NULL
);

CREATE TABLE clases (
    id_clase SERIAL PRIMARY KEY,
    nombre_clase VARCHAR(50) NOT NULL,
    descripcion TEXT,
    horario TIME NOT NULL,
    dia_semana VARCHAR(10) NOT NULL,
    id_entrenador INT REFERENCES entrenadores(id_entrenador) ON DELETE SET NULL
);
-- Tabla de inscripciones a clases
CREATE TABLE inscripciones (
    id_inscripcion SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    id_clase INT REFERENCES clases(id_clase) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--DATOS DE PRUEBAS 

-- Membresías
INSERT INTO membresias (tipo, precio, duracion_meses) VALUES
('Mensual', 50.00, 1),
('Trimestral', 140.00, 3),
('Anual', 500.00, 12);

-- Clientes
INSERT INTO clientes (nombre, apellido, fecha_nacimiento, email, telefono) VALUES
('Juan', 'Granda', '1990-05-10', 'juan@email.com', '0991234567'),
('Maria', 'Lopez', '1995-08-20', 'maria@email.com', '0987654321');

-- Entrenadores
INSERT INTO entrenadores (nombre, apellido, email, telefono, especialidad, fecha_contratacion) VALUES
('Carlos', 'Perez', 'carlos@email.com', '0991122334', 'Yoga', '2023-01-15'),
('Laura', 'Martinez', 'laura@email.com', '0988877665', 'Spinning', '2022-09-20');

-- Clases
INSERT INTO clases (nombre_clase, descripcion, horario, dia_semana, id_entrenador) VALUES
('Yoga', 'Clase de Yoga para principiantes', '08:00', 'Lunes', 1),
('Spinning', 'Entrenamiento de spinning intenso', '18:00', 'Miércoles', 2);

-- Pagos
INSERT INTO pagos (id_cliente, id_membresia, monto) VALUES
(1, 1, 50.00),
(2, 2, 140.00);

-- Inscripciones
INSERT INTO inscripciones (id_cliente, id_clase) VALUES
(1, 1),
(2, 2);



