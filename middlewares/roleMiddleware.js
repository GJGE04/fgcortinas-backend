// middlewares/verifyRole.js
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
  
  module.exports = verifyRole;