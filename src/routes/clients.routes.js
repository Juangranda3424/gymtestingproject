const express = require('express');
const { getAllClients, createClient, updateClient, deleteClient } = require('../controllers/clients.controller');

const router = express.Router();

//CLIENTES
router.get('/', getAllClients);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;