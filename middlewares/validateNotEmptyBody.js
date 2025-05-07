// middlewares/validateNotEmptyBody.js

const validateNotEmptyBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
    }
    next();
  };
  
  module.exports = validateNotEmptyBody;
  