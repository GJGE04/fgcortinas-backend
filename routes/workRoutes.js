// backend/routes/work.js
const express = require('express');
const router = express.Router();

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyRole } = require('../middlewares/roleMiddleware');
const ROLES = require('../config/roles');

// Middleware combinado para Admin y Superadmin
const tecnicoAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.TECNICO)];

// Importar controladores
const {
  createWork,
  getWork,
  updateWork,
  deleteWork,
  generatePDF,
  getWorkOptions
} = require('../controllers/workController');

// ──────────── Rutas ─────────────

// Obtener todos los trabajos (público o protegido según lo definas)
router.get('/', tecnicoAccess, getWork);

// Generar PDF (puede requerir protección si es sensible)
router.get('/generatePDF', tecnicoAccess, generatePDF);

// Obtener las opciones de tipo y estado de trabajo
router.get('/work-options', tecnicoAccess, getWorkOptions);

// Otras rutas protegidas 
router.post('/', tecnicoAccess, createWork);
router.put('/:id', tecnicoAccess, updateWork);
router.delete('/:id', tecnicoAccess, deleteWork);

// Ruta de prueba para verificar la conexión
router.get('/test', async (req, res) => {
  try {
    const works = await Work.find();
    res.json(works);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los trabajos' });
  }
});

module.exports = router;