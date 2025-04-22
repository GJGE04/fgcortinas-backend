const express = require('express');
const router = express.Router();

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');   
const { verifyRole } = require('../middlewares/roleMiddleware');
 

// Importar los roles definidos
const ROLES = require('../config/roles');

// Middleware combinado para evitar repetir
const adminEditorAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR)];

// Importar controladores
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// ──────────── Rutas ─────────────

// Rutas públicas
router.get('/', getProducts);           // Obtener todos los productos (accesible para todos)
router.get('/:id', getProductById);     // Obtener un producto por ID (accesible para todos)

// Rutas protegidas
router.post('/', adminEditorAccess, createProduct);           // Crear un nuevo producto (solo para admin y superadmin)
router.put('/:id', adminEditorAccess, updateProduct);         // Actualizar un producto (solo para admin y superadmin)
router.delete('/:id', adminEditorAccess, deleteProduct);      // Eliminar un producto (solo para admin y superadmin)

module.exports = router;
