const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const ctrl = require('../controllers/adminSettingsController');

router.get('/settings', ctrl.getAdminSettings);
router.put('/settings', verifyToken, ctrl.updateAdminSettings);

module.exports = router;
