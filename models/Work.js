// models/Trabajo.js

const mongoose = require('mongoose');
const WORKTYPE = require('../config/workType');
const WORKSTATE = require('../config/workState');

const workSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente', // Relación con el modelo Cliente
    required: true,
  },
  tecnicos: [{
    type: mongoose.Schema.Types.ObjectId, // Cambiado de "Schema.Types.ObjectId" a "mongoose.Schema.Types.ObjectId"
    ref: 'User', // Relación con el modelo User (técnico)
    required: true,
  }],
  /*
  direccion: {
    type: [String], // Dirección puede ser un array de strings
    required: true,
    default: []
  },
  telefonos: {
    type: [String], // Telefónos puede ser un array de strings
    required: true,
    default: []
  },
  */
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  tipo: {
    type: String,
    enum: Object.values(WORKTYPE),
    required: true,
    default: WORKTYPE.PRESUPUESTO, 
  },
  estado: {
    type: String,
    enum: Object.values(WORKSTATE),
    default: WORKSTATE.ENESPERA,
  },
  fechaComienzo: { type: Date, default: null },  // Valor por defecto
  fechaFinalizacion: { type: Date, default: null },  // Valor por defecto
  horaComienzo: { type: String, default: '' },  // Valor por defecto
  horaFinalizacion: { type: String, default: '' },  // Valor por defecto
  fechaUltimoEstado: {
    type: Date,
    default: Date.now,
  },
  activo: {
    type: Boolean,
    default: true,
  },
});

const Work = mongoose.model('Work', workSchema);

module.exports = Work;
