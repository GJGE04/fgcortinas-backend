// utils/formatearDescripcionGoogle.js

const Cliente = require('../models/Client');
const Tecnico = require('../models/User');

const formatearDescripcionGoogle = async ({ direccion, clienteId, tecnicosIds, tipo }) => {
  try {
    const cliente = await Cliente.findById(clienteId);
    const tecnicos = await Tecnico.find({ _id: { $in: tecnicosIds } });

    const descripcion = `
📍 Dirección: ${direccion || "No especificada"}
👤 Cliente: ${cliente?.nombre || "Sin nombre"}
📞 Teléfono: ${cliente?.telefono || "Sin teléfono"}
👷 Técnicos: ${tecnicos.map(t => t.nombre).join(", ") || "Sin técnicos"}
📌 Tipo: ${tipo || "No especificado"}
`.trim();

    return descripcion;

  } catch (error) {
    console.error("❌ Error generando descripción para Google Calendar:", error);
    return "⚠️ Información incompleta o error al generar descripción.";
  }
};

const { formatearDescripcionDesdeCita } = require('./calendar');

const formatearDescripcionConIds = async ({ direccion, clienteId, tecnicosIds = [], tipo }) => {
  const cliente = clienteId ? await Cliente.findById(clienteId) : null;
  const tecnicos = tecnicosIds.length ? await Tecnico.find({ _id: { $in: tecnicosIds } }) : [];

  const citaFalsa = {
    direccion,
    tipo,
    cliente,
    tecnicos,
  };

  return formatearDescripcionDesdeCita(citaFalsa);
};

// module.exports = formatearDescripcionGoogle;

module.exports = { formatearDescripcionGoogle, formatearDescripcionConIds };
