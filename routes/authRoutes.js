// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { checkRoles, register, login, logoutUser, changePassword} = require('../controllers/authController');  // Asegúrate de que las funciones estén bien importadas
const { verifyToken } = require('../middlewares/authMiddleware');
const { forgotPassword, resetPassword } = require('../controllers/authController');

// Ruta para registrar un nuevo usuario
router.post('/register', register);  // Aquí debes tener correctamente asociada la función registerUser

// Ruta para el login
router.post('/login', login);

// Ruta para cerrar sesión (requiere autenticación)
router.post('/logout', verifyToken, logoutUser);

// Cambiar contraseña (requiere estar autenticado)
router.put('/change-password', verifyToken, changePassword);

// Ruta para verificar roles
router.get('/check-roles', checkRoles);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/validateToken', verifyToken, (req, res) => {
    res.status(200).json({
      message: 'Token válido y usuario activo',
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role,
      },
      isValid: true
    });
  });  

module.exports = router;
