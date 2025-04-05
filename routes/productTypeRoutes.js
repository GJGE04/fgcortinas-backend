
// routes/productTypeRoutes.js

const express = require('express');
const router = express.Router();

// Importar las funciones del controlador y los middlewares
const { createProductType, getProductTypes, updateProductType, deleteProductType, searchProductTypes } = require('../controllers/productTypeController'); // Asegúrate de que el nombre del controlador sea el correcto
const { verifyToken, verifyTokenBearer, isAdminOrSuperAdmin } = require('../middleware/authMiddleware');   // , authorizeRole (incluir si se desea esta variante)
// const { authorizeRole } = require('../middleware/authMiddleware'); // Importar el middleware  (otra vía)

// const ProductType = require('../models/ProductType'); // Modelo de Producto

// Ruta para obtener todos los tipos de productos (acceso para todos). (solo lectura, accesible por cualquier usuario)
router.get('/', getProductTypes);

router.get('/search', searchProductTypes);  // Buscar por criterio

// Ruta para crear un nuevo tipo de producto (solo admin o superadmin) 
// router.post('/', createProductType);                                               // Sin middleware de autorización.
router.post('/', verifyTokenBearer, isAdminOrSuperAdmin, createProductType);                // Se requiere autorización
// router.post('/', verifyToken, authorizeRole(['superadmin', 'admin']), createProductType);

// Ruta para actualizar un tipo de producto por ID 
// router.put('/:id', updateProductType);                                             // Sin middleware de autorización.
router.put('/:id', verifyTokenBearer, isAdminOrSuperAdmin, updateProductType);              // Se requiere autorización (solo admin o superadmin)
// router.put('/:id', authorizeRole(['superadmin', 'admin']), updateProductType);     // otras variantes
// router.put('/product-types/:id', isAdminOrSuperAdmin, updateProductType);          // otras variantes

// Ruta para eliminar un tipo de producto por ID
// router.delete('/:id', deleteProductType);                                          // Sin middleware de autorización. 
router.delete('/:id', verifyTokenBearer, isAdminOrSuperAdmin, deleteProductType);           // Se requiere autorización. Ruta para eliminar un tipo de producto por ID (solo admin o superadmin)
// router.delete('/product-types/:id', isAdminOrSuperAdmin, deleteProductType);       // Otras variantes. Asegúrate de que tu router tenga el middleware de autorización

// Ruta de prueba para verificar la conexión
router.get('/test', async (req, res) => {
  try {
    const typesofproducts = await ProductType.find();
    res.json(typesofproducts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tipos de productos' });
  }
});


/*
// Ruta para agregar un nuevo tipo de producto (solo accesible por admin y superadmin)
router.post('/', authorizeRole(['superadmin', 'admin']), async (req, res) => {
  const { title, format, active } = req.body;
  try {
    const newProductType = new ProductType({ title, format, active });
    await newProductType.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/

/*
// Obtener un tipo de producto por ID
router.get('/:id', async (req, res) => {
  try {
    const productType = await ProductType.findById(req.params.id);
    if (!productType) return res.status(404).json({ message: 'Tipo de producto no encontrado' });
    res.status(200).json(productType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar, editar un tipo de producto (solo accesible por admin y superadmin)
router.put('/:id', authorizeRole(['superadmin', 'admin']), async (req, res) => {
  // router.put('/:id', verifyToken, authorizeRole(['superadmin', 'admin']), async (req, res) => {
    // Aquí va la lógica para actualizar el tipo de producto
  const { id } = req.params;
  const { title, format, active } = req.body;
  try {
    const updatedProductType = await ProductType.findByIdAndUpdate(id, { title, format, active }, { new: true });
    if (!updatedProductType) return res.status(404).json({ message: 'Tipo de producto no encontrado' });
    res.status(200).json(updatedProductType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Eliminar un tipo de producto
router.delete('/:id', async (req, res) => {
  try {
    const deletedProductType = await ProductType.findByIdAndDelete(req.params.id);
    if (!deletedProductType) return res.status(404).json({ message: 'Tipo de producto no encontrado' });
    res.status(200).json({ message: 'Tipo de producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/

module.exports = router;
