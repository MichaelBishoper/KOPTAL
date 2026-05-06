const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/unitsController');
const { verifyToken } = require('../../middleware/auth');

router.get('/', ctrl.listUnits);
router.get('/:id', ctrl.getUnit);

// protected
router.post('/', verifyToken, ctrl.createUnit);
router.put('/:id', verifyToken, ctrl.updateUnit);
router.delete('/:id', verifyToken, ctrl.removeUnit);

module.exports = router;
