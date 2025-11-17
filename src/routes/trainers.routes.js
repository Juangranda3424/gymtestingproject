const express = require('express');
const router = express.Router();
const trainersController = require('../controllers/trainers.controller');

/**
 * Rutas CRUD para la entidad "entrenadores"
 */

// Obtener todos los entrenadores
router.get('/', trainersController.getAllTrainers);
// Obtener un entrenador por ID
router.get('/:id', trainersController.getTrainerById);
// Crear un nuevo entrenador
router.post('/', trainersController.createTrainer);
// Actualizar un entrenador existente
router.put('/:id', trainersController.updateTrainer);
// Eliminar un entrenador
router.delete('/:id', trainersController.deleteTrainer);

module.exports = router;