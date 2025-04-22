// routes/logRoutes.js

const express = require('express');
const router = express.Router();
const AccessLog = require('../models/AccessLog');
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyAdminOrSuperAdmin } = require('../middlewares/roleMiddleware');

// GET /api/logs?userId=&tipo=&desde=&hasta=
router.get('/', verifyToken, verifyAdminOrSuperAdmin, async (req, res) => {
  try {
    const { userId, tipo, desde, hasta } = req.query;

    const filtro = {};

    if (userId) filtro.userId = userId;
    if (tipo) filtro.tipo = tipo;

    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) filtro.fecha.$lte = new Date(hasta);
    }

    const logs = await AccessLog.find(filtro).sort({ fecha: -1 });

    res.json(logs);
  } catch (err) {
    console.error('Error al obtener logs:', err);
    res.status(500).json({ message: 'Error al obtener logs' });
  }
});

module.exports = router;