// services/mailer.js    -   Este archivo contendrá la lógica para enviar emails con PDF adjunto:
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Esta función envía el correo
const sendResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"Soporte Cortinas" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Recuperación de contraseña',
    html: `
      <h3>Hola,</h3>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Podés hacerlo haciendo clic en el siguiente enlace:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p><b>Este enlace es válido por 1 hora.</b></p>
      <p>Si no solicitaste esto, podés ignorar este mensaje.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};


const sendBudgetEmailV1 = async (to, pdfBuffer, fileName = 'presupuesto.pdf') => {
  const mailOptions = {
    from: `"FG Cortinas" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Presupuesto solicitado',
    html: `
      <h3>Hola,</h3>
      <p>Adjunto encontrarás el presupuesto solicitado.</p>
      <p>Gracias por confiar en FG Cortinas.</p>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

// mailer.js ✅ ← Toda la lógica para enviar el correo
// services/mailer.js   -   // ✅ Nueva función para enviar presupuesto con PDF adjunto
async function sendBudgetEmail(to, pdfBuffer, filename = 'presupuesto.pdf', bodyHtml = '', clienteName = '') {
  try { /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });  */

    const mailOptions = {
      from: `"Presupuestos FG Cortinas" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Presupuesto FGC solicitado',
      // text: 'Adjunto presupuesto en formato PDF.',
      html: `
        <h3>Hola ${clienteName},</h3>
        <p>Adjunto encontrarás el presupuesto solicitado.</p>
        
        <p>Gracias por confiar en FG Cortinas.</p>
      `,
      /*  esto se mevió del html.
      <hr>
        <p>${bodyHtml || 'Gracias por confiar en FG Cortinas.'}</p>
        
        <p>Gracias por confiar en FG Cortinas.</p>
        */
      attachments: [
        {
          filename, // ✅ corregido    
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📤 Correo enviado:', info.response);
    console.log(`📤 Correo enviado a ${to} con asunto "${mailOptions.subject}"`);

    return { success: true, info };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, error };
  }
}

/* envir vrios destintrios
const nodemailer = require('nodemailer');

const sendBudgetEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    let recipients = req.body.to;

    if (!recipients) {
      return res.status(400).json({ error: 'Falta el campo "to" con los correos destinatarios' });
    }

    // Acepta array o string separado por comas
    if (typeof recipients === 'string') {
      recipients = recipients.split(',').map(email => email.trim());
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Falta el archivo PDF adjunto' });
    }

    // Configurar transportador de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,      // desde .env
        pass: process.env.EMAIL_PASS,      // desde .env
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: subject || 'Presupuesto generado',
      text: message || 'Adjuntamos su presupuesto en PDF.',
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
};

module.exports = { sendBudgetEmail };
*/

module.exports = { sendResetEmail, sendBudgetEmail, };