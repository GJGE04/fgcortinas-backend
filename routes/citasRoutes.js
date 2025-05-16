const express = require('express');
const router = express.Router();
const {
  createCita,
  updateCita,
  deleteCita,
  getCitas
} = require('../controllers/citaController'); // asegurate de que el nombre del archivo coincida

// Importar los roles definidos
const ROLES = require('../config/roles');

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyRole } = require('../middlewares/roleMiddleware');

// Middleware combinado para Admin y Superadmin
const tecnicoAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.TECNICO)];

// Ruta para crear nueva cita
router.post('/', tecnicoAccess, createCita);

// ✅ PUT /api/citas/:id        // Editar una cita existente
router.put('/:id', tecnicoAccess, updateCita);

// ✅ DELETE /api/citas/:id     // Eliminar una cita
router.delete('/:id', tecnicoAccess, deleteCita);

// ✅ GET /api/citas     // Obtener citas (con filtros opcionales)
router.get('/', tecnicoAccess, getCitas);

module.exports = router;