// models/ProductType.js
const mongoose = require('mongoose');

const productTypeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,  // El título es obligatorio
  },
  format: {
    type: String,
    required: true,  // El formato también es obligatorio
  },
  active: {
    type: Boolean,
    default: true,   // El estado activo por defecto es verdadero
  },
}, {
  timestamps: true,  // Para almacenar las fechas de creación y actualización
});

const ProductType = mongoose.model('ProductType', productTypeSchema);

module.exports = ProductType;