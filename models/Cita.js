const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  direccion: {
    type: String,
    required: false,
  },
  telefono: {
    type: String,
    required: false, // Lo puedes hacer obligatorio si prefieres
  },
  tipo: {
    type: String,
    enum: ['Agenda Visita', 'Presupuesto', 'Trabajo', 'Garantía'],
    required: true,
  },
  tecnicos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Asegúrate de que sea el nombre correcto del modelo de técnicos
    required: true,
  }],
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  trabajoAsociado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Work', // Este modelo puede ser opcional
    default: null,
  },
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFin: {
    type: Date,
    required: true,
  },
  googleEventId: {
    type: String,
    required: false, // útil si querés vincular con Google Calendar
    default: null
  },
  source: {
    type: String,
    enum: ["sistema", "google"],
    default: "sistema",
  },  
}, {
  timestamps: true, // crea automáticamente createdAt y updatedAt
});

citaSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Cita = mongoose.model('Cita', citaSchema);

module.exports = Cita;