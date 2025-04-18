// utils/mailer.js
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

module.exports = { sendResetEmail };