// routes/email.js (o donde tengas tus rutas)
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/send-budget-email2', async (req, res) => {
  console.log('BODY RECIBIDO:', req.body); // <-- agrega esto
  const { budgetData, pdfBase64 } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // o el proveedor que uses
      auth: {
        user: process.env.EMAIL_USER, // por seguridad usar variables de entorno
        pass: process.env.EMAIL_PASS,
      },
    });

    // Decodificamos el base64 del PDF
    const base64Data = pdfBase64.split(';base64,').pop();

    const mailOptions = {
      from: `"Presupuestos" <${process.env.EMAIL_USER}>`,
      to: 'gjuniorge@gmail.com', // cambiar por budgetData.clientEmail si lo tenés
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
    console.log('Correo enviado desde email:', info); // <-- esto te dirá si se envió y a qué dirección

    res.status(200).json({ message: '✅ Correo enviado correctamente' });
  } catch (error) {
    console.error('❌ Error al enviar el email:', error);
    res.status(500).json({ error: 'Error al enviar el email', details: error.message });
  }
});

router.get('/send-test-email', async (req, res) => {
    try {
      // Configuración del transporte
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,       
          pass: process.env.EMAIL_PASS,
        }
      });
  
      // Contenido del mail
      const mailOptions = {
        from: process.env.EMAIL_USER,  
        to: 'oficinafgcortinas@gmail.com',
        subject: '📧 Prueba de Email desde el backend',
        text: 'Este es un correo de prueba enviado desde Node.js usando nodemailer.'
      };
  
      // Enviar email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: '✅ Correo enviado correctamente' });
    } catch (error) {
      console.error('❌ Error al enviar el email:', error);
      res.status(500).json({ error: 'Error al enviar el email', details: error.message });
    }
  });

module.exports = router;