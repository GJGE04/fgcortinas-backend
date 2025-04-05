const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  work: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work', // Relación con el modelo Work (Trabajo)
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Relación con el modelo Producto
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      width: {
        type: Number,
        required: true,
      },
      length: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
        default: 0,
      },
      subtotal: {
        type: Number,
        required: true,
      },
    },
  ],
  totalUYU: {
    type: Number,
    required: true,
  },
  totalUSD: {
    type: Number,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente', // Relación con el modelo Cliente
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relación con el modelo User (Técnico)
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
