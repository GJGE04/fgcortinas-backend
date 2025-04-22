// pdfGenerator.js ✅ (opcional) si querés generar el PDF en backend
// Este archivo debería generar un PDF en buffer a partir de los datos del presupuesto:

// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');

function generarPresupuestoPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.fontSize(18).text('Presupuesto FGC', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Cliente: ${data.client}`);
      doc.text(`Producto: ${data.product}`);
      doc.text(`Cantidad: ${data.quantity}`);
      doc.text(`Total: $${data.total}`);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generarPresupuestoPDF };