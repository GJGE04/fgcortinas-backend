// routes/authRoutes.js

const express = require('express');
const { checkRoles, registerUser, loginUser  } = require('../controllers/authController');  // Asegúrate de que las funciones estén bien importadas
const router = express.Router();

// Ruta para verificar roles
router.get('/check-roles', checkRoles);

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);  // Aquí debes tener correctamente asociada la función registerUser

// Ruta para el login
router.post('/login', loginUser);

module.exports = router;
