const express = require('express');
const router = express.Router();

const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const { getRoles, getAvailableRoles } = require('../controllers/roleController');

// Si querés que esté protegido por token o admin:
router.get('/', verifyToken, getRoles);
router.get('/available', getAvailableRoles); // GET /api/roles/available

module.exports = router;
