const express = require('express');
const {
  getAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership
} = require('../controllers/membership.controller');

const router = express.Router();

// MEMBRESÍAS
router.get('/', getAllMemberships);
router.post('/', createMembership);
router.put('/:id', updateMembership);
router.delete('/:id', deleteMembership);

module.exports = router;
