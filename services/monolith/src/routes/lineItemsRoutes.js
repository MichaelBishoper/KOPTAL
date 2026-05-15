const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const lineItem = require('../controllers/lineItemsController');

router.post('/', verifyToken, lineItem.addLineItem);
router.get('/order/:po_id', verifyToken, lineItem.getLineItems);
router.delete('/:po_item_id', verifyToken, lineItem.removeLineItem);

module.exports = router;