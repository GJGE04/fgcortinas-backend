// utils/calendar.js
function formatearDescripcionGoogle(cita) {
    const partes = [];
  
    if (cita.cliente?.nombre) partes.push(`👤 Cliente: ${cita.cliente.nombre}`);
    if (cita.cliente?.telefono) partes.push(`📞 Teléfono: ${cita.cliente.telefono}`);
    if (cita.cliente?.email) partes.push(`✉️ Email: ${cita.cliente.email}`);
    if (cita.direccion) partes.push(`📍 Dirección: ${cita.direccion}`);
    if (cita.tecnicos?.length) {
      const tecnicos = Array.isArray(cita.tecnicos)
        ? cita.tecnicos.map(t => t.nombre || t.username || 'Técnico').join(', ')
        : cita.tecnicos;
      partes.push(`🛠️ Técnico(s): ${tecnicos}`);
    }
    if (cita.trabajoAsociado?.titulo) {
      partes.push(`🔧 Trabajo asociado: ${cita.trabajoAsociado.titulo}`);
      if (cita.trabajoAsociado.descripcion) {
        partes.push(`📝 Descripción: ${cita.trabajoAsociado.descripcion}`);
      }
    }
  
    return partes.join('\n');
  }
  
  module.exports = { formatearDescripcionGoogle };
  
  