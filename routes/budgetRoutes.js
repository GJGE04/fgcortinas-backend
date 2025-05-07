const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Importar middlewares
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyRole } = require('../middlewares/roleMiddleware');
const validateNotEmptyBody = require('../middlewares/validateNotEmptyBody');

// Importar los roles definidos
const ROLES = require('../config/roles');

// Middleware combinado para Admin y Superadmin
const tecnicoAccess = [verifyToken, verifyRole(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.TECNICO)];

// Importar controladores
const { createBudget, getBudgets, getAllBudgets, getBudgetById, getBudgetsDetail, deleteBudgetForId, updateBudget, updateBudgetStatus, updateBudgetPartial } = require('../controllers/budgetController');

// Enviar email
const { sendBudgetEmail } = require('../services/mailer');  
// const { generarPresupuestoPDF } = require('../utils/pdfGenerator'); // si tenés una función para generar el PDF

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ──────────── Rutas ─────────────

// Ruta para crear un presupuesto
router.post('/budget', tecnicoAccess, createBudget);

// Ruta para obtener todos los presupuestos
router.get('/budgets', tecnicoAccess, getBudgets);

// Ruta para obtener todos los presupuestos
router.get('/allbudgets', tecnicoAccess, getAllBudgets);  // obtener ademas info de clientes, tecnicos, productos y trabajo

// Ruta para obtener todos los presupuestos
router.get('/budgetsdetail', tecnicoAccess, getBudgetsDetail);

// Ruta para obtener un presupuesto por ID
router.get('/budget/:id', tecnicoAccess, getBudgetById);

// Eliminar un presupuesto por su ID
router.delete('/budget/:id', tecnicoAccess, deleteBudgetForId);

// Ruta para obtener un presupuesto por ID
router.put('/budget/:id', tecnicoAccess, updateBudget);

// pdf credo desde el bckend
router.post('/send-budget', async (req, res) => {
  try {
    const { email, presupuestoData } = req.body;

    // generar el PDF (esto depende de tu implementación)
    const pdfBuffer = await generarPresupuestoPDF(presupuestoData);

    // enviar el email
    await sendBudgetEmail(email, pdfBuffer);

    res.status(200).json({ message: 'Presupuesto enviado con éxito' });
  } catch (error) {
    console.error('Error al enviar el presupuesto:', error);
    res.status(500).json({ error: 'Error al enviar el presupuesto' });
  }
});

// pdf credo desde el frontend
// Envío del PDF generado desde el frontend (base64 o file)
router.post('/send-budget-email', upload.single('pdf'), async (req, res) => {
    try {
      const { to } = req.body;
      const pdfBuffer = req.file?.buffer;

      if (!to || !pdfBuffer) {
        return res.status(400).json({ message: 'Faltan campos requeridos (email o PDF)' });
      }
  
      const result = await sendBudgetEmail(to, pdfBuffer, req.file.originalname || 'Presupuesto_FGC.pdf');

      if (result.success) {
        return res.status(200).json({ message: '✅ Presupuesto enviado con éxito' });
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Error enviando presupuesto:", error);
      return res.status(500).json({ message: '❌ Error al enviar el presupuesto', error: error.message });
    }
  });

  // budgetRoutes.js ✅ ← Deja la ruta /send-budget-email acá
  router.post('/send-budget-email2', async (req, res) => {
    const { budgetData, pdfBase64 } = req.body;
  
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',   // o el proveedor a usar
        auth: {
          user: process.env.EMAIL_USER,     // por seguridad usar variables de entorno
          pass: process.env.EMAIL_PASS,
        },
      });
      // Decodificamos el base64 del PDF
      const base64Data = pdfBase64.split(';base64,').pop();
  
      const mailOptions = {
        from: `"Presupuestos FGC" <${process.env.EMAIL_USER}>`,
        // to: budgetData.clientEmail || 'oficinafgcortinas@gmail.com', // o el email del cliente
        to: budgetData.clientEmail || 'oficinafgcortinas@gmail.com', // o el email del cliente
        subject: `Presupuesto: ${budgetData.name}`,
        text: `Adjunto presupuesto para el cliente ${budgetData.client}.`,
        attachments: [
          {
            filename: `${budgetData.name}.pdf`,
            content: Buffer.from(base64Data, 'base64'),
            contentType: 'application/pdf',
          },
        ],
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('📤 Correo enviado:', info.response);     // <-- esto te dirá si se envió y a qué dirección
  
      res.status(200).json({ message: '✅ Correo enviado correctamente' });
    } catch (error) {
      console.error('❌ Error al enviar el correo:', error);
      res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
    }
  });

  router.post('/send-budget-base64', async (req, res) => {
    const { budgetData, pdfBase64 } = req.body;

    if (!budgetData?.clientEmail || !pdfBase64) {
        return res.status(400).json({ message: 'Faltan campos requeridos (email o base64)' });
      }
    try {
      const base64Data = pdfBase64.split(';base64,').pop();
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      const result = await sendBudgetEmail(budgetData.clientEmail, pdfBuffer, `${budgetData.name}.pdf`);
      if (result.success) {
        return res.status(200).json({ message: '✅ Correo enviado correctamente' });
      } else {
        throw result.error;
      }
    } catch (error) {
        console.error('❌ Error al enviar email base64:', error);
        return res.status(500).json({ message: '❌ Error al enviar el correo', error: error.message });
    }
  });  

const { generarPresupuestoPDF } = require('../utils/pdfGenerator');

// Envío de presupuesto generando PDF desde backend
router.post('/send-budget-backend', async (req, res) => {
  try {
    const { to, budgetData } = req.body;

    if (!to || !budgetData) {
      return res.status(400).json({ message: 'Faltan campos requeridos: to y budgetData' });
    }

    // Generar PDF en backend
    const pdfBuffer = await generarPresupuestoPDF(budgetData);

    // Enviar email
    const result = await sendBudgetEmail(to, pdfBuffer, `${budgetData.client}_Presupuesto.pdf`);

    if (result.success) {
      return res.status(200).json({ message: '✅ Presupuesto generado y enviado con éxito' });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('❌ Error en /send-budget-backend:', error);
    res.status(500).json({ message: '❌ Error al generar o enviar presupuesto', error: error.message });
  }
});

router.patch('/budget/:id/status', tecnicoAccess, updateBudgetStatus);

router.patch('/budget/:id', tecnicoAccess, validateNotEmptyBody , updateBudgetPartial);

module.exports = router;