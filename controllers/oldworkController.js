const OldWork = require('../models/OldWork');

// Crear un trabajo
const createOldWork = async (req, res) => {
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

// Obtener todos los trabajos
const getOldWork = async (req, res) => {
  try {
    const oldtrabajos = await OldWork.find().populate('cliente', 'nombre').exec();   // Rellenar los datos de cliente. // Esto llena el campo cliente con el nombre
    res.status(200).json(oldtrabajos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los trabajos' });
  }
};

// Actualizar un trabajo
const updateOldWork = async (req, res) => {
  try {
    const { tipo, estado, activo } = req.body;
    const oldtrabajoActualizado = await OldWork.findByIdAndUpdate(
      req.params.id,
      { tipo, estado, activo, fechaUltimoEstado: new Date(), fechaCreacion: new Date() },
      { new: true }
    );
    res.status(200).json(oldtrabajoActualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al actualizar el trabajo' });
  }
};

// Eliminar un trabajo
const deleteOldWork = async (req, res) => {
  try {
    const oldtrabajoEliminado = await OldWork.findByIdAndDelete(req.params.id);
    res.status(200).json(oldtrabajoEliminado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al eliminar el trabajo' });
  }
};

// Generar PDF del trabajo
const generatePDF = async (req, res) => {
  try {
    const oldtrabajo = await OldWork.findById(req.params.id);
    if (!oldtrabajo) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }
    // Aquí generamos el PDF con los datos del trabajo
    // (Puedes usar una librería como pdfkit o cualquier otro generador de PDFs)
    res.status(200).json({ message: 'PDF generado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar el PDF' });
  }
};

const getOldWorkOptions = (req, res) => {   
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
    res.json({
      tipo: tipoOptions,
      estado: estadoOptions
    });
  };

module.exports = {
    createOldWork,    
    getOldWork,      
    updateOldWork,  
    deleteOldWork,  
    generatePDF, 
    getOldWorkOptions
  };
