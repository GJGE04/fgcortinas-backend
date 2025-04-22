// middleware/authMiddleware.js

// El archivo middleware/authMiddleware.js se encargará de verificar el rol del usuario decodificado del token JWT.
// El middleware de autorización es el encargado de verificar si el usuario tiene el rol adecuado para acceder a ciertas rutas.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AccessLog = require('../models/AccessLog');

// Función para verificar el token JWT
const verifyToken = async (req, res, next) => {
  console.log('Entrando a verifyToken...');  // <-- DEBUG

  // Obtener el token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];   // Bearer TOKEN
  if (!token){
    console.warn('[verifyToken] ❌ Token no proporcionado');
    return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
  }

  try {
    // Verificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    // Decodifica el token usando la clave secreta
    const user = await User.findById(decoded.id);

    if (!user) {
      console.warn('[verifyToken] ❌ Usuario no encontrado para el token');
      await AccessLog.create({
        motivo: 'Token válido, pero usuario no existe',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({ message: 'Usuario no encontrado' });
    } 

    if (!user.activo) {
      console.warn(`[verifyToken] ⚠️ Usuario desactivado intentó acceder - username: ${user.username}, id: ${user._id}`);

      await AccessLog.create({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        tipo: 'Acceso Denegado',
        motivo: 'Usuario desactivado',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.status(403).json({ message: 'El usuario está desactivado. Acceso denegado.' });
    }

    console.log(`[verifyToken] ✅ Token válido para usuario: ${user.username}, rol: ${user.role}`);

    await AccessLog.create({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      tipo: 'Acceso Permitido',
      motivo: 'Token válido y usuario activo',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.user = user;
    next();
  } catch (err) {
    console.error('[verifyToken] ❌ Token inválido o expirado:', err.message);
    await AccessLog.create({
      motivo: `Token inválido o expirado: ${err.message}`,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

/*
// Middleware para verificar si el usuario es Admin o SuperAdmin
const verifyAdminOrSuperAdmin = (req, res, next) => {

  // Verificar si el usuario tiene permisos para crear nuevos usuarios (solo superadmin o admin)
  if (!req.user || (req.user.role !== 'Superadmin' && req.user.role !== 'Admin')) {
    return res.status(403).json({ message: 'Acceso denegado. No tienes permisos suficientes para realizar esta acción.' });
  }
  next();   // Si pasa la validación, continúa con la ejecución
};
*/

// module.exports = { verifyToken, verifyRole, verifyAdminOrSuperAdmin };
module.exports = { verifyToken };

/*
Explicación del código:
* authorizeRole: Este middleware recibe un arreglo de roles permitidos (roles). Verifica que el token esté presente, lo decodifica y luego valida que el rol del usuario esté en el arreglo de roles permitidos. Si el rol no está permitido, responde con un 403 Forbidden.
* Decodificación del token: El token es verificado y decodificado utilizando jwt.verify(). Luego, los datos decodificados (incluyendo el role) se guardan en req.user, lo que te permite acceder a él en las rutas protegidas.
* Uso de la autorización en las rutas: Si el usuario tiene el rol adecuado, el middleware permite que la solicitud continúe. Si no, se responde con un error.
*/
