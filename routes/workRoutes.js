const express = require('express');
const router = express.Router();

// Importar las funciones del controlador y los middlewares
const { createWork, getWork, updateWork, deleteWork, generatePDF, getWorkOptions } = require('../controllers/workController'); 
const { verifyToken, verifyTokenBearer, isAdminOrSuperAdmin } = require('../middleware/authMiddleware');   

router.get('/', getWork);

router.get('/generatePDF', generatePDF);  

router.post('/', verifyTokenBearer, isAdminOrSuperAdmin, createWork);               

router.put('/:id', verifyTokenBearer, isAdminOrSuperAdmin, updateWork);             

router.delete('/:id', verifyTokenBearer, isAdminOrSuperAdmin, deleteWork);         

// Ruta para obtener las opciones de tipo y estado
router.get('/work-options', getWorkOptions);

// Ruta de prueba para verificar la conexión
router.get('/test', async (req, res) => {
  try {
    const works = await Work.find();
    res.json(works);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los trabajos' });
  }
});

module.exports = router;