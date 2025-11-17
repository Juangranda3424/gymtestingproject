const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classes.controller');

/**
 * Routes for classes (clases)
 * Base path to mount in app.js: /api/classes
 */

// Obtener todas las clases
router.get('/', classesController.getAllClasses);
// Obtener clase por id
router.get('/:id', classesController.getClassById);
// Crear nueva clase
router.post('/', classesController.createClass);
// Actualizar clase existente (parcial o completa)
router.put('/:id', classesController.updateClass);
// Eliminar clase
router.delete('/:id', classesController.deleteClass);

module.exports = router;