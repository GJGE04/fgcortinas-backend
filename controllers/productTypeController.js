// controllers/productTypeController.js

const ProductType = require('../models/ProductType');                       // Asegúrate de tener el modelo de Producto

// Función para crear un nuevo tipo de producto
const createProductType = async (req, res) => {    // router.post('/', authorizeRole(['superadmin', 'admin']), async (req, res) => {
  try {
    const { title, format, active } = req.body;

    // Verificar que todos los datos necesarios estén presentes
    if (!title || !format) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }

    // Crear un nuevo tipo de producto
    const newProductType = new ProductType({
      title,
      format,
      active,
    });

    // Guardar el nuevo producto en la base de datos
    await newProductType.save();

    return res.status(201).json({
      message: "Tipo de producto creado exitosamente.",
      product: newProductType,
    });
  } catch (err) {
    console.error("Error al crear el tipo de producto:", err);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

// Función para obtener todos los tipos de productos (visible para todos los roles)
const getProductTypes = async (req, res) => {
  try {
    const products = await ProductType.find();
    return res.status(200).json(products);
  } catch (err) {
    console.error('Error al obtener los tipos de producto:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Función para actualizar un tipo de producto por ID
const updateProductType = async (req, res) => {
  try {
    const { title, format, active } = req.body;
    const productId = req.params.id; // El ID viene de la URL

    // Verificar que el tipo de producto exista
    const updatedProductType = await ProductType.findByIdAndUpdate(
      productId,
      { title, format, active },
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedProductType) {
      return res.status(404).json({ message: 'Tipo de producto no encontrado' });
    }

    return res.status(200).json({
      message: 'Tipo de producto actualizado con éxito',
      product: updatedProductType,
    });
  } catch (err) {
    console.error("Error al actualizar el tipo de producto:", err);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

// Función para eliminar un tipo de producto por ID
const deleteProductType = async (req, res) => {
  try {
    const productId = req.params.id; // El ID viene de la URL

    // Verificar que el tipo de producto exista
    const deletedProductType = await ProductType.findByIdAndDelete(productId);

    if (!deletedProductType) {
      return res.status(404).json({ message: 'Tipo de producto no encontrado' });
    }

    return res.status(200).json({
      message: 'Tipo de producto eliminado con éxito',
      product: deletedProductType,
    });
  } catch (err) {
    console.error("Error al eliminar el tipo de producto:", err);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

// Función para obtener un tipo de producto por un criterio de búsqueda (ejemplo: title)
const searchProductTypes = async (req, res) => {
  try {
    const { title } = req.query;  // Obtener el parámetro 'title' de los query params

    if (!title) {
      return res.status(400).json({ message: 'Debe proporcionar un título para la búsqueda.' });
    }

    // Buscar tipos de productos que coincidan con el título
    const foundProducts = await ProductType.find({ title: { $regex: title, $options: 'i' } });

    if (foundProducts.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos que coincidan con ese título.' });
    }

    return res.status(200).json(foundProducts);
  } catch (err) {
    console.error("Error al buscar los tipos de producto:", err);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

/*
// Ruta para obtener todos los tipos de productos (solo lectura, accesible por cualquier usuario)
router.get('/', async (req, res) => {
  try {
    const productTypes = await ProductType.find();
    res.status(200).json(productTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
*/


module.exports = {
  createProductType,    // Asegúrate de tener todas las funciones que necesitas
  getProductTypes,      // Exportamos también la función getProductTypes
  // Otras funciones que puedas tener
  updateProductType,  // Exportamos la nueva función de actualizar
  deleteProductType,  // Exportamos la nueva función de eliminar
  searchProductTypes, // Exportamos la función de búsqueda
};