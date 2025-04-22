// backend/routes/oldwork.js
const express = require('express');
const router = express.Router();

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyRole } = require('../middlewares/roleMiddleware');
const ROLES = require('../config/roles');

// Middleware combinado para proteger rutas de escritura
const adminEditorAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.TECNICO)];

// Importar controladores
const {
  createOldWork,
  getOldWork,
  updateOldWork,
  deleteOldWork,
  generatePDF,
  getOldWorkOptions
} = require('../controllers/oldworkController');

// ──────────── Rutas ─────────────

// Rutas públicas
router.get('/', adminEditorAccess, getOldWork);                        // Obtener trabajos anteriores
router.get('/generatePDF', adminEditorAccess, generatePDF);            // Generar PDF de trabajos anteriores
router.get('/oldwork-options', adminEditorAccess, getOldWorkOptions);  // Obtener opciones de tipo y estado

// Rutas protegidas
router.post('/', adminEditorAccess, createOldWork);       // Crear nuevo trabajo anterior
router.put('/:id', adminEditorAccess, updateOldWork);     // Editar trabajo anterior
router.delete('/:id', adminEditorAccess, deleteOldWork);  // Eliminar trabajo anterior

// Ruta de prueba
router.get('/test', async (req, res) => {
  try {
    const oldworks = await require('../models/OldWork').find();
    res.json(oldworks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los trabajos' });
  }
});

module.exports = router;