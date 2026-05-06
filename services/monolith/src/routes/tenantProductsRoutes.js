const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tenantProductsController');
const { verifyToken } = require('../../middleware/auth');

router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);

// protected
router.post('/', verifyToken, ctrl.createProduct);
router.put('/:id', verifyToken, ctrl.updateProduct);
router.delete('/:id', verifyToken, ctrl.removeProduct);

module.exports = router;
