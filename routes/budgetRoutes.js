const express = require('express');
const router = express.Router();

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Importar los roles definidos
const ROLES = require('../config/roles');

// Middleware combinado para Admin y Superadmin
const tecnicoAccess = [verifyToken, authorizeRoles(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.TECNICO)];

// Importar controladores
const { createBudget, getBudgets, getBudgetById, getBudgetsDetail, deleteBudgetForId } = require('../controllers/budgetController');

// ──────────── Rutas ─────────────

// Ruta para crear un presupuesto
router.post('/budget', tecnicoAccess, createBudget);

// Ruta para obtener todos los presupuestos
router.get('/budgets', tecnicoAccess, getBudgets);

// Ruta para obtener todos los presupuestos
router.get('/budgetsdetail', tecnicoAccess, getBudgetsDetail);

// Ruta para obtener un presupuesto por ID
router.get('/budget/:id', tecnicoAccess, getBudgetById);

// Eliminar un presupuesto por su ID
router.delete('/budget/:id', tecnicoAccess, deleteBudgetForId);

module.exports = router;