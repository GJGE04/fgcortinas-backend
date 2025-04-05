// backend/routes/user.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
// const jwt = require('jsonwebtoken');
const { verifyAdmin, verifyTokenBearer, isAdminOrSuperAdmin } = require('../middleware/authMiddleware');    // Middleware para verificar autenticación

// Importar las funciones del controlador y los middlewares
const { createUser, getUser, getUserForId, updateUser, deleteUser } = require('../controllers/userController'); 
/*
// Ruta de autenticación (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Verificar que el email y la contraseña sean proporcionados
  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor ingresa tu email y contraseña' });
  }

  try {
    // Buscar al usuario en la base de datos por email
    const user = await User.findOne({ email });

     if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si la contraseña proporcionada coincide con la almacenada en la base de datos
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrectaUser' });
    }

    // Si todo es correcto, generar el token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // El token caduca en 1 hora
    );

    // Devolver una respuesta de éxito (sin el token por ahora)
    return res.status(200).json({
      message: 'Autenticación exitosa',
      token: token, // Este token debería enviarse como parte de la respuesta
      user: { email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al intentar iniciar sesión: ' + err.message });
  }
});
*/

// Endpoint para crear un usuario (solo accesible para superadmin y admin)
router.post('/create-user', verifyTokenBearer, verifyAdmin, async (req, res) => {
  
  const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
  
  try {
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'user',  // Default to 'user' if no role provided
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la creación del usuario' });
  }
});

// Obtener todos los usuarios
router.get('/', getUser);

// Obtener un usuario por su ID
router.get('/:id', getUserForId);

// Crear un nuevo usuario
router.post('/', verifyTokenBearer, isAdminOrSuperAdmin, createUser);               

// Editar un usuario por su ID
router.put('/:id', verifyTokenBearer, isAdminOrSuperAdmin, updateUser);             

// Eliminar un usuario por su ID
router.delete('/:id', verifyTokenBearer, isAdminOrSuperAdmin, deleteUser);         


module.exports = router;
