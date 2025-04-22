// middlewares/roleMiddleware.js

const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Acceso denegado. Este recurso requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        });
      }
      next();
    };
  };

const verifyAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Superadmin')) {
    return res.status(403).json({ message: 'Acceso denegado. Requiere rol Admin o Superadmin.' });
  }
  next();
};

module.exports = { verifyRole, verifyAdminOrSuperAdmin };