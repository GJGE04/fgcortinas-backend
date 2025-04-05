// backend/routes/protectedRoute.js
const express = require('express');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso permitido', user: req.user });
});

module.exports = router;
