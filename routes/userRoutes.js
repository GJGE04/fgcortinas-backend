// backend/routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');       // Middleware para verificar autenticación
const { verifyRole } = require('../middlewares/roleMiddleware'); 
const ROLES = require('../config/roles');

// Middleware combinado para Admin y Superadmin, etc.
const adminAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN)];
const tecnicoAccess = [verifyToken, verifyRole(ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.TECNICO)]; 

// Importar controladores
const {
  createUser,
  getUser,
  getUserForId,
  updateUser,
  deleteUser,
  getTecnicos
} = require('../controllers/userController');

// ──────────── Rutas ─────────────

 // Obtener todos los usuarios (solo admin y superadmin)
router.get('/', adminAccess, getUser);

// Obtener un usuario por su ID (solo admin y superadmin)
router.get('/:id', adminAccess, getUserForId);

// Crear un nuevo usuario (solo admin y superadmin)
router.post('/', adminAccess, createUser);

// Crear usuario alternativo (por si querés dejar el endpoint `/create-user`)
router.post('/create-user', adminAccess, async (req, res) => {
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
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la creación del usuario' });
  }
});

// Actualizar un usuario por ID (solo admin y superadmin)
router.put('/:id', adminAccess, updateUser);

// Eliminar un usuario por ID (solo admin y superadmin)
router.delete('/:id', adminAccess, deleteUser);   

 // Obtener todos los tecnicos (solo admin y superadmin y tecnicos)
 router.get('/role/tecnicos', tecnicoAccess, getTecnicos);

module.exports = router;

// Si el endpoint /create-user no es estrictamente necesario aparte del POST /, 
// podés eliminarlo o dejarlo si querés una ruta explícita.


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

             

      



