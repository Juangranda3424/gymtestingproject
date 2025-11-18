const express = require('express');
// Controladores de membresías
const {
  getAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership
} = require('../controllers/membership.controller');

const router = express.Router();

// MEMBRESÍAS
router.get('/', getAllMemberships);   // Obtener todas las membresías
router.post('/', createMembership);   // Crear una nueva membresía
router.put('/:id', updateMembership);   //  Actualizar una membresía existente
router.delete('/:id', deleteMembership);    //  Eliminar una membresía

module.exports = router;
