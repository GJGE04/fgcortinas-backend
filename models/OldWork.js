// models/Trabajos viejos.js

const mongoose = require('mongoose');

const oldworkSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente', // Relación con el modelo Cliente
    required: true,
    justOne: true,  // Solo necesitamos un cliente, no un arreglo
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  tipo: {
    type: String,
    enum: ['Agenda de presupuesto', 'Presupuesto Visita', 'Presupuesto Online', 'Presupuesto'],
    required: true,
  },
  estado: {
    type: String,
    enum: ['Finalizado', 'Iniciado', 'En Proceso', 'En Espera'],
    default: 'En Espera',
  },
  fechaUltimoEstado: {
    type: Date,
    default: Date.now,
  },
  activo: {
    type: Boolean,
    default: true,
  },
});

const OldWork = mongoose.model('OldWork', oldworkSchema);

module.exports = OldWork;
