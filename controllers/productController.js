const Product = require('../models/Product');
const { isAdminOrSuperAdmin } = require('../middleware/authMiddleware');

// Crear un nuevo producto
const createProduct = async (req, res) => {
  try {
    const { image, name, code, price, costPrice, stock, currency, productType, isActive } = req.body;

    if (!name || !code || !price || !stock || !currency || !productType) {
      return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    const newProduct = new Product({
      image,
      name,
      code,
      price,
      costPrice,
      stock,
      currency,
      productType,
      isActive,
    });

    await newProduct.save();
    return res.status(201).json({ message: 'Producto creado exitosamente.', product: newProduct });
  } catch (err) {
    console.error("Error al crear el producto:", err);
    return res.status(500).json({ message: "Error en el servidor." });
  }
};

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('productType'); // Agregar populate para incluir el tipo de producto
    return res.status(200).json(products);
  } catch (err) {
    console.error('Error al obtener los productos:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('productType');
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.error('Error al obtener el producto:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
  try {
    const { image, name, code, price, costPrice, stock, currency, productType, isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { image, name, code, price, costPrice, stock, currency, productType, isActive },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.status(200).json({ message: 'Producto actualizado exitosamente', product });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    return res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar el producto:', err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
