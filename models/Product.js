const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  image: { type: String, required: false },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  stock: { type: Number, required: true },
  currency: { type: String, required: true },
  productType: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductType', required: true }, // Relación con el modelo ProductType
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
