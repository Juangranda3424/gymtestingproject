const express = require('express');
const router = express.Router();
const inscriptionsController = require('../controllers/inscriptions.controller');

// INSCRIPCIONES
router.get('/', inscriptionsController.getAllInscriptions);
router.get('/:id', inscriptionsController.getInscriptionById);
router.post('/', inscriptionsController.createInscription);
router.put('/:id', inscriptionsController.updateInscription);
router.delete('/:id', inscriptionsController.deleteInscription);

module.exports = router;