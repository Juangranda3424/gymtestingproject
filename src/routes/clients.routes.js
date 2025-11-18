const express = require('express');
const { getAllClients, createClient, updateClient, deleteClient } = require('../controllers/clients.controller');

const router = express.Router();

//CLIENTES
router.get('/', getAllClients);     // Obtener todos los clientes
router.post('/', createClient);     // Crear un nuevo cliente
router.put('/:id', updateClient);   //  Actualizar un cliente existente
router.delete('/:id', deleteClient);    // Eliminar un cliente

module.exports = router;