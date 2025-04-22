
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyRole } = require('../middlewares/roleMiddleware');

// Importar los roles definidos
const ROLES = require('../config/roles');

// Middleware combinado para admin, superadmin y editor
const adminEditorAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR)];

// Importar controladores
const {
  createClient,
  getClient,
  updateClient,
  deleteClient,
  searchClient
} = require('../controllers/clientController');

// ──────────── Rutas ─────────────

// Rutas públicas
router.get('/', getClient);                        // Obtener todos los clientes
router.get('/search/:_id', searchClient);          // Buscar cliente por ID o criterio

// Rutas protegidas
router.post('/', adminEditorAccess, createClient);          // Crear cliente
router.put('/:id', adminEditorAccess, updateClient);        // Actualizar cliente
router.delete('/:id', adminEditorAccess, deleteClient);     // Eliminar cliente

// Ruta de prueba
router.get('/test', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
});   

// Ruta de prueba para verificar la conexión
router.get('/test', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los clientes' });
  }
});

module.exports = router;
