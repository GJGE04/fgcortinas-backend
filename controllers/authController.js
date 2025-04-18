// controllers/authController.js
const User = require('../models/User');  // Asegúrate de importar el modelo User
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const { sendResetEmail } = require('../services/mailer'); // Asegurate que la ruta sea correcta

const generateToken = user => {
  return jwt.sign(
    { id: user._id, role: user.role, username: user.username, email: user.email, activo: user.activo }, 
    process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};
/*
const generarToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  // 1.Se agrega el id de usuario y su rol al payload
  // 2. Asegúrate de tener un secreto en el archivo .env
  // 3. El token expirará en 1 hora
};
*/

// Función para registrar un usuario
const register = async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe un usuario con ese email
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ message: 'El usuario ya está registrado' });

    // Verifica si ya hay un admin o superadmin
    const adminExists = await User.findOne({ role: 'Admin' });
    const superadminExists = await User.findOne({ role: 'Superadmin' });

    const authHeader = req.headers.authorization;
    let isAuthenticated = false;
    let requesterRole = 'Guest';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAuthenticated = true;
        requesterRole = decoded.role;
        console.log('Token válido. Rol:', decoded.role);        
      } catch (err) {
        console.log('Token inválido o expirado');
      }
    }

    // Lógica para definir el rol del nuevo usuario
    if (!adminExists && !superadminExists) {
      // No hay admins aún → permitimos crear uno sin estar autenticado
      role = role || 'Admin';
      console.log('Primer usuario creado como Admin');
    } else if (isAuthenticated && (requesterRole === 'Admin' || requesterRole === 'Superadmin')) {
      // Si el que hace la petición es Admin o Superadmin, puede asignar cualquier rol
      role = role || 'Guest'; // Si no se envía rol, se fuerza a Guest
    } else {
      // No autenticado => solo puede crear un Guest. // Si no está autenticado o no tiene rol elevado, se fuerza Guest
      role = 'Guest';
    }

    // Lógica de creación de usuario aquí
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({ message: 'Usuario registrado correctamente', role: newUser.role, token });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Ocurrió un error al registrar el usuario' });
  }
};

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

// Función para autenticar al usuario
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    user.ultimoAcceso = new Date();
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};

const logoutUser = (req, res) => {
  // Solo informativo ya que JWT no se almacena en servidor
  res.status(200).json({ message: 'Sesión cerrada' });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    const passwordCorrecta = await user.comparePassword(currentPassword);
    if (!passwordCorrecta) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña', error: err.message });
  }
};

// Esta función genera un token y lo "envía" al usuario (lo mostramos por consola por ahora):
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const token = crypto.randomBytes(20).toString('hex');
    // console.log(`Enlace de recuperación: http://localhost:5173/reset-password/${token}`);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // const resetLink = `http://localhost:3000/reset-password/${token}`; 
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    // console.log(`🔗 Enlace de recuperación de contraseña: ${resetLink}`);    (desarrollo)
    // res.json({ message: 'Se ha enviado el enlace de recuperación al email (simulado)' });
    
    // Enviar el email real
    await sendResetEmail(user.email, resetLink);
    res.json({ message: 'Se ha enviado el enlace de recuperación al email' });
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    res.status(500).json({ message: 'Error al enviar el correo', error: err.message });
  }
};

// Esta función verifica el token y cambia la contraseña:
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // const { token, password } = req.body; // v.2 el token que va en el body del reset-password

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // no expirado
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    res.status(500).json({ message: 'Error en resetPassword', error: err.message });
  }
};

module.exports = { register, checkRoles,  login, changePassword, logoutUser, forgotPassword, resetPassword };
