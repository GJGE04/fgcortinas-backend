const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, getBudgetById, getBudgetsDetail, deleteBudgetForId } = require('../controllers/budgetController');
const { verifyToken, verifyTokenBearer, isAdminOrSuperAdmin } = require('../middleware/authMiddleware');  

// Ruta para crear un presupuesto
router.post('/budget', createBudget);

// Ruta para obtener todos los presupuestos
router.get('/budgets', getBudgets);

// Ruta para obtener todos los presupuestos
router.get('/budgetsdetail', getBudgetsDetail);

// Ruta para obtener un presupuesto por ID
router.get('/budget/:id', getBudgetById);

// Eliminar un presupuesto por su ID
router.delete('/budget/:id', verifyTokenBearer, isAdminOrSuperAdmin, deleteBudgetForId);

module.exports = router;