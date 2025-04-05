const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: false },
  direcciones: [{ type: String }], // Un array de direcciones
  telefonos: [{ type: String }],   // Un array de teléfonos
  correos: [{ type: String }],     // Un array de correos electrónicos
  activo: { type: Boolean, default: true },  // Estado de si está activo o no
}, {
  timestamps: true, // Esto agregará campos createdAt y updatedAt
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;
