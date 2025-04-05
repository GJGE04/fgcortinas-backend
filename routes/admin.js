// backend/routes/admin.js

const express = require('express');
// const bcrypt = require('bcryptjs');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate de tener tu modelo de usuario
const router = express.Router();

// Endpoint para crear el usuario inicial (solo lo usas una vez)
router.post('/create-initial-user', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Verifica si ya existe un usuario con el rol de 'superadmin' en la base de datos
    const existingUser = await User.findOne({ role: 'superadmin' });
    if (existingUser) {
      // return res.status(400).json({ message: 'Ya existe un usuario superadmin.' });
    }

    // Asignar un valor predeterminado para el username
    const username = email.split('@')[0]; // Usamos la parte antes de @ como username

    // Crea el nuevo usuario (superadmin por defecto)
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,  // Asegúrate de asignar el valor de username
        email,
        password: hashedPassword,
        role: role || 'user',
      });

    await newUser.save();

    // Genera un token JWT para el nuevo usuario
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, 
      // 'secret_key', 
      process.env.JWT_SECRET,  // Usar variable de entorno
      { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuario creado con éxito', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la creación del usuario inicial' });
  }
});

module.exports = router;
