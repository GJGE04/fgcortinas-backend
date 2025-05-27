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
  getWorkOptions,
  getWorkOptionsKV,
  getAllWorks
} = require('../controllers/workController');

// ──────────── Rutas ─────────────

// ✔ Primero las rutas específicas. 

// ✅ Obtener todos los trabajos (público o protegido según lo definas)
router.get('/', tecnicoAccess, getAllWorks);

// ✅ Obtener las opciones de tipo y estado de trabajo (¡esta va antes que "/:id"!)
router.get('/work-options', tecnicoAccess, getWorkOptions);

// ✅ Obtener las opciones de tipo y estado de trabajo (versión key-value)
router.get('/work-optionskv', tecnicoAccess, getWorkOptionsKV);

// ✅ Generar PDF (puede requerir protección si es sensible)
router.get('/generatePDF', tecnicoAccess, generatePDF);

// ✔ Luego las rutas generales (por ID). // Otras rutas protegidas 
// ✅ Trae uno por ID (esta debe ir después de las rutas específicas)
router.get('/:id', tecnicoAccess, getWork);

// ✅ Crear nuevo trabajo
router.post('/', tecnicoAccess, createWork);

// ✅ Actualizar trabajo
router.put('/:id', tecnicoAccess, updateWork);

// ✅ Eliminar trabajo
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