const express = require('express');
const router = express.Router();

// Importar las funciones del controlador y los middlewares
const { createOldWork, getOldWork, updateOldWork, deleteOldWork, generatePDF, getOldWorkOptions } = require('../controllers/oldworkController'); 
const { verifyToken, verifyTokenBearer, isAdminOrSuperAdmin } = require('../middleware/authMiddleware');   

router.get('/', getOldWork);

router.get('/generatePDF', generatePDF);  

router.post('/', verifyTokenBearer, isAdminOrSuperAdmin, createOldWork);               

router.put('/:id', verifyTokenBearer, isAdminOrSuperAdmin, updateOldWork);             

router.delete('/:id', verifyTokenBearer, isAdminOrSuperAdmin, deleteOldWork);         

// Ruta para obtener las opciones de tipo y estado
router.get('/oldwork-options', getOldWorkOptions);

// Ruta de prueba para verificar la conexión
router.get('/test', async (req, res) => {
  try {
    const oldworks = await OldWork.find();
    res.json(oldworks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los trabajos' });
  }
});

module.exports = router;