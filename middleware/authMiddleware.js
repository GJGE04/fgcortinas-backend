// middleware/authMiddleware.js

// El archivo middleware/authMiddleware.js se encargará de verificar el rol del usuario decodificado del token JWT.
// El middleware de autorización es el encargado de verificar si el usuario tiene el rol adecuado para acceder a ciertas rutas.

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header
  if (!token) {
    return res.status(401).json({ message: 'No se ha proporcionado un token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // req.userId = decoded.id; // Asignamos el userId del token a la solicitud
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const verifyAdmin = (req, res, next) => {

  // Verificar si el usuario tiene permisos para crear nuevos usuarios (solo superadmin o admin)
  if (!req.user || (req.user.role !== 'superadmin' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Acceso denegado. No tienes permisos suficientes.' });
  }
  next();   // Si pasa la validación, continúa con la ejecución
};

// Función para verificar el token JWT
const verifyTokenBearer = (req, res, next) => {
  // Obtener el token del encabezado Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se encontró el token' });
  }

  try {
    // Verificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    // Decodifica el token usando la clave secreta

    // Asignar la información decodificada al objeto 'user' de la solicitud
    req.user = decoded;                                           // Guardar la información del usuario en el objeto `req` (la solicitud)

    // Continuar con la ejecución del siguiente middleware
    next();
  } catch (err) {
    // Si el token es inválido o ha expirado, retorna un error
    return res.status(400).json({ message: 'Token no válido o expirado.' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No se ha proporcionado un token de autenticación' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }

    // Agregar la información del usuario al request
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  });
};

// Middleware para verificar si el usuario es Admin o SuperAdmin
const isAdminOrSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
    return res.status(403).json({ message: 'Acceso denegado. Requiere rol de Admin para esta acción.' });
  }
  next();
};

const isAdminOrSuperAdmin2 = (req, res, next) => {
  // Aquí verificamos el rol del usuario
  const userRole = req.user?.role; // Suposición de que el rol del usuario está en req.user

  if (userRole === 'admin' || userRole === 'superadmin') {
    return next(); // Permite continuar con la solicitud
  }

  return res.status(403).json({ message: "Acceso denegado, no tienes permisos suficientes" });
};

// Middleware para verificar si el usuario tiene el rol adecuado. // Middleware para verificar el token
const authorizeRole = (roles) => {      // const authenticateToken
  return (req, res, next) => {
    // Verificar que el token JWT esté presente
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Esto asume que el token se pasa en el header de la solicitud

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, token no proporcionado' });
    }

    try {
      // Verificamos y decodificamos el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;  // Decodificamos el token y lo añadimos a la solicitud para su uso posterior

      // Verificamos si el rol del usuario está en la lista de roles permitidos
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Acceso denegado, no tienes permisos suficientes' });
      }

      next(); // Si todo está bien, pasamos al siguiente middleware o controlador
    } catch (error) {
      console.error('Error al verificar el token:', error);
      res.status(500).json({ message: 'Error en la verificación del token' });
    }
  };
};


module.exports = { authenticate, verifyAdmin , verifyTokenBearer, verifyToken, isAdminOrSuperAdmin, authorizeRole };

/*
Explicación del código:
* authorizeRole: Este middleware recibe un arreglo de roles permitidos (roles). Verifica que el token esté presente, lo decodifica y luego valida que el rol del usuario esté en el arreglo de roles permitidos. Si el rol no está permitido, responde con un 403 Forbidden.
* Decodificación del token: El token es verificado y decodificado utilizando jwt.verify(). Luego, los datos decodificados (incluyendo el role) se guardan en req.user, lo que te permite acceder a él en las rutas protegidas.
* Uso de la autorización en las rutas: Si el usuario tiene el rol adecuado, el middleware permite que la solicitud continúe. Si no, se responde con un error.
*/
