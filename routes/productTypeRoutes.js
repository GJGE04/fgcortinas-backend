
// routes/productTypeRoutes.js
const express = require('express');
const router = express.Router();

// Importar las funciones del controlador
const { createProductType, getProductTypes, updateProductType, deleteProductType, searchProductTypes } = require('../controllers/productTypeController'); // Asegúrate de que el nombre del controlador sea el correcto
// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');   
const { verifyRole } = require('../middlewares/roleMiddleware');

// Importar los roles definidos
const ROLES = require('../config/roles');

// ──────────── Rutas ─────────────

// Obtener todos los tipos de productos (acceso público)
router.get('/', getProductTypes);

// Buscar por criterio
router.get('/search', searchProductTypes);

// Crear un nuevo tipo de producto (solo Admin, Superadmin, Editor)
router.post(
  '/',
  verifyToken,
  verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR),
  createProductType
);

// Actualizar un tipo de producto (Admin, Superadmin, Editor)
router.put(
  '/:id',
  verifyToken,
  verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR),
  updateProductType
);

// Eliminar un tipo de producto (Admin, Superadmin, Editor)
router.delete(
  '/:id',
  verifyToken,
  verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR),
  deleteProductType
);

// Ruta de prueba (opcional, para debug)
router.get('/test', async (req, res) => {
  try {
    const typesofproducts = await ProductType.find();
    res.json(typesofproducts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tipos de productos' });
  }
});

module.exports = router;