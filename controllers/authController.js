// controllers/authController.js
const User = require('../models/User');  // Asegúrate de importar el modelo User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Función para verificar si existen roles de superadmin o admin
const checkRoles = async (req, res) => {
  try {
    // Verifica si hay un usuario con rol de superadmin
    const superadmin = await User.findOne({ role: 'Superadmin' });
    // Verifica si hay un usuario con rol de admin
    const admin = await User.findOne({ role: 'Admin' });

    // Responde al frontend con los resultados
    res.status(200).json({
      superadminExists: !!superadmin,
      adminExists: !!admin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar los roles' });
  }
};

// Función para registrar un usuario
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    // Lógica de creación de usuario aquí
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Función para autenticar al usuario
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Verificar la contraseña con bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Crear un token JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Se agrega el id de usuario y su rol al payload
      process.env.JWT_SECRET, // Asegúrate de tener un secreto en el archivo .env
      { expiresIn: '1h' } // El token expirará en 1 hora
    );

    // Responder con el token y el rol
    return res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { checkRoles, registerUser, loginUser };
