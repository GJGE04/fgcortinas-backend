// backend/controllers/oldworkController.js

const OldWork = require('../models/OldWork');

// Obtener todos los trabajos anteriores
const getOldWork = async (req, res) => {
  try {
    const oldWorks = await OldWork.find().populate('cliente', 'nombre').exec();   // Rellenar los datos de cliente. // Esto llena el campo cliente con el nombre;
    res.status(200).json(oldWorks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los trabajos anteriores', error });
  }
};

// Crear un nuevo trabajo anterior
const createOldWork = async (req, res) => {
  try {
    const newOldWork = new OldWork(req.body);
    await newOldWork.save();
    res.status(201).json({ message: 'Trabajo anterior creado exitosamente', oldWork: newOldWork });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el trabajo anterior', error });
  }
};

// Crear un trabajo
const createOldWork2 = async (req, res) => {
  try {
    const { cliente, tipo, estado, fechaCreacion, fechaUltimoEstado, activo } = req.body;

    // Asegúrate de que los datos son válidos
    if (!cliente || !tipo || !estado || !fechaCreacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const nuevoOldTrabajo = new OldWork({
      cliente,
      tipo,
      estado,
      fechaCreacion,
      fechaUltimoEstado,
      activo,
    });

    await nuevoOldTrabajo.save();

    res.status(201).json(nuevoOldTrabajo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el trabajo' });
  }
};

// Actualizar un trabajo anterior
const updateOldWork = async (req, res) => {
  try {
    const updatedOldWork = await OldWork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOldWork) {
      return res.status(404).json({ message: 'Trabajo anterior no encontrado' });
    }
    res.status(200).json({ message: 'Trabajo anterior actualizado', oldWork: updatedOldWork });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el trabajo anterior', error });
  }
};

// Actualizar un trabajo
const updateOldWork2 = async (req, res) => {
  try {
    const { cliente, tipo, estado, activo } = req.body;
    const oldtrabajoActualizado = await OldWork.findByIdAndUpdate(
      req.params.id,
      { cliente, tipo, estado, activo, fechaUltimoEstado: new Date(), fechaCreacion: new Date() },
      { new: true }
    );

    if (!oldtrabajoActualizado) {
      return res.status(404).json({ message: 'Trabajo antiguo no encontrado' });
    }

    res.status(200).json(oldtrabajoActualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al actualizar el trabajo' });
  }
};

// Eliminar un trabajo anterior
const deleteOldWork = async (req, res) => {
  try {
    const deletedOldWork = await OldWork.findByIdAndDelete(req.params.id);
    if (!deletedOldWork) {
      return res.status(404).json({ message: 'Trabajo anterior no encontrado' });
    }
    res.status(200).json({ message: 'Trabajo anterior eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el trabajo anterior', error });
  }
};

// Generar PDF (simulación, deberías personalizar según tu lógica de PDF)
const generatePDF = async (req, res) => {
  try {
    // Aquí podrías generar un PDF con datos de OldWork y enviarlo como archivo
    const oldtrabajo = await OldWork.findById(req.params.id);
    if (!oldtrabajo) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }
    // Aquí generamos el PDF con los datos del trabajo
    // (Puedes usar una librería como pdfkit o cualquier otro generador de PDFs)
    res.status(200).json({ message: 'PDF generado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar el PDF', error });
  }
};

// Obtener opciones (por ejemplo: tipos, estados, etc.)
const getOldWorkOptions = (req, res) => {
  try {
    const tipoOptions = [
      'Agenda de presupuesto',
      'Presupuesto Visita',
      'Presupuesto Online',
      'Presupuesto'
    ];
  
    const estadoOptions = [  
      'Finalizado',
      'Iniciado',
      'En Proceso',
      'En Espera'
    ];
    // Devolver las opciones como una respuesta JSON
    res.status(200).json({ 
      tipo: tipoOptions,
      estado: estadoOptions });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener opciones', error });
  }
};

module.exports = {
  getOldWork,
  createOldWork,
  updateOldWork,
  deleteOldWork,
  generatePDF,
  getOldWorkOptions
};
