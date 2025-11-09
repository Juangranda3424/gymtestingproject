const pool = require('../db/conn');

/*
    Devuelve todos los clientes almacenados en la base de datos
*/

async function getAllClients(req, res){

    try {
        //Consulto 
        const result = await pool.query('SELECT * FROM clientes');

        //Devuelvo resultados
        res.status(200).json(result.rows);

    } catch {
        
        res.status(500).json({ message: 'Error al obtener los clientes' });
    }

}

/*
    Crea un cliente nuevo en la base de datos
*/

async function createClient(req, res){

    try {
        
        const {name, lastname, birthdate, email, cell } = req.body;

        if (!name || !email || !lastname || !birthdate || !cell ) {
            return res.status(400).json({ message: 'Faltan datos del cliente' });
        }

        const search = await pool.query('SELECT * FROM clientes WHERE email=$1',[email]);

        if (search.rows.length > 0) {
            return res.status(409).json({ message: 'El cliente ya existe' });
        }

        const result = await pool.query(
        'INSERT INTO clientes (nombre, apellido, fecha_nacimiento, email, telefono) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, lastname, birthdate, email, cell ]
        );

        res.status(201).json(result.rows[0]);

    } catch {

        res.status(500).json({ message: 'Error al crear el cliente' });
        
    }

}

/*
    Actualiza un cliente en la base de datos
*/

async function updateClient(req, res){

    try {
        
        const {name, lastname, email, cell } = req.body;
        const { id } = req.params;

        if (!name && !email && !lastname && !cell) {
            return res.status(400).json({ message: 'Actualización de datos del cliente invalida' });
        }

        const result = await pool.query(
        'UPDATE clientes SET nombre=$1, apellido=$2, email=$3, telefono=$4 WHERE id_cliente=$5 RETURNING *',
        [name, lastname, email, cell, id ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json(result.rows[0]);

    } catch {

        res.status(500).json({ message: 'Error al actualizar el cliente' });
        
    }

}

/*
    Elimina un cliente de forma logica en la base de datos
*/

async function deleteClient(req, res) {

    try {

        const { id } = req.params;

        const result = await pool.query('SELECT * FROM clientes WHERE id_cliente=$1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado en la base de datos' });
        }

        const resultDelete = await pool.query('UPDATE clientes SET estado=$1 WHERE id_cliente=$2 RETURNING *',[false, id]);

        res.status(200).json(resultDelete.rows[0]);
        
    } catch {
        res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
    
}

module.exports = {
    getAllClients,
    createClient,
    updateClient,
    deleteClient
};