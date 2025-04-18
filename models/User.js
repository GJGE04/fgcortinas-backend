// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../config/roles');

// Definir el esquema de User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(ROLES),
    default: ROLES.GUEST,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  ultimoAcceso: {
    type: Date,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,

}, {
  timestamps: true,
});

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Solo encriptar si la contraseña ha cambiado

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar la contraseña ingresada con la almacenada
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Crear el modelo de User basado en el esquema
const User = mongoose.model('User', userSchema);

module.exports = User;
