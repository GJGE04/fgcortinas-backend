const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  username: String,
  email: String,
  role: String,
  tipo: {
    type: String,
    enum: ['Acceso Denegado', 'Acceso Permitido'],
    default: 'Acceso Denegado'
  },
  motivo: String,
  ip: String,
  userAgent: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);