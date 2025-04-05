
const express = require('express');
const router = express.Router();

// Importar las funciones del controlador y los middlewares
const { createClient, getClient, updateClient, deleteClient, searchClient } = require('../controllers/clientController'); 
const { verifyToken, verifyTokenBearer, isAdminOrSuperAdmin } = require('../middleware/authMiddleware');   

router.get('/', getClient);

router.get('/search/:_id', searchClient);  

router.post('/', verifyTokenBearer, isAdminOrSuperAdmin, createClient);               

router.put('/:id', verifyTokenBearer, isAdminOrSuperAdmin, updateClient);             

router.delete('/:id', verifyTokenBearer, isAdminOrSuperAdmin, deleteClient);         

// Ruta de prueba para verificar la conexión
router.get('/test', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientesT' });
  }
});

module.exports = router;
