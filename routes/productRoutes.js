const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../middleware/authMiddleware'); // Asegúrate de importar la función de autorización
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Obtener todos los productos (accesible para admin y superadmin)
router.get('/', authorizeRole(['Admin', 'Superadmin']), getProducts);

// Obtener un producto por ID (accesible para admin y superadmin)
router.get('/:id', authorizeRole(['Admin', 'superadmin', 'guest']), getProductById);

// Crear un nuevo producto (solo para admin y superadmin)
router.post('/', authorizeRole(['Admin', 'Superadmin']), createProduct);

// Actualizar un producto (solo para admin y superadmin)
router.put('/:id', authorizeRole(['Admin', 'superadmin']), updateProduct);

// Eliminar un producto (solo para admin y superadmin)
router.delete('/:id', authorizeRole(['Admin', 'superadmin']), deleteProduct);

module.exports = router;
