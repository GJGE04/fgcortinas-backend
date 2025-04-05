const Work = require('../models/Work');

// Crear un trabajo
const createWork = async (req, res) => {
  try {
    // Extraemos todos los datos necesarios desde req.body
    const { 
      cliente, 
      tecnico, 
      direccion, 
      telefonos, 
      tipo, 
      estado, 
      fechaComienzo, 
      fechaFinalizacion, 
      horaComienzo, 
      horaFinalizacion, 
      activo 
    } = req.body;

    // Asegurarnos de que los campos 'tecnico', 'fechaComienzo', 'fechaFinalizacion', etc. sean proporcionados
    if (!cliente || !tecnico || !direccion || !telefonos || !tipo || !estado) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Crear un nuevo trabajo con los datos extraídos
    const nuevoTrabajo = new Work({
      cliente,
      tecnico,
      direccion,
      telefonos,
      tipo,
      estado,
      fechaComienzo: fechaComienzo ? new Date(fechaComienzo) : null,
      fechaFinalizacion: fechaFinalizacion ? new Date(fechaFinalizacion) : null,
      horaComienzo,
      horaFinalizacion,
      activo,
      fechaUltimoEstado: new Date(),
    });

    // Guardamos el nuevo trabajo en la base de datos
    await nuevoTrabajo.save();

    // Devolvemos una respuesta con el trabajo recién creado
    res.status(201).json(nuevoTrabajo);
  } catch (error) {
    // En caso de error, devolvemos un mensaje de error
    console.error(error);
    res.status(400).json({ message: 'Error al crear el trabajo', error: error.message });
  }
};

// Obtener todos los trabajos
const getWork = async (req, res) => {
  try {
    const trabajos = await Work.find().populate('cliente'); // Rellenar los datos de cliente
    res.status(200).json(trabajos);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al obtener los trabajos' });
  }
};

// Actualizar un trabajo
const updateWork = async (req, res) => {
  try {
    const { 
      cliente,
      tecnico,
      direccion, telefonos, tipo, estado, activo, 
      fechaComienzo,
      fechaFinalizacion,
      horaComienzo,
      horaFinalizacion,
    } = req.body;

    const trabajoActualizado = await Work.findByIdAndUpdate(
      req.params.id,
      { cliente,
        tecnico,
        direccion, telefonos, tipo, estado, activo, fechaUltimoEstado: new Date(),
        fechaComienzo,
        fechaFinalizacion,
        horaComienzo,
        horaFinalizacion,
       },
      { new: true }
    );

    if (!trabajoActualizado) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }

    res.status(200).json(trabajoActualizado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al actualizar el trabajo' });
  }
};

// Eliminar un trabajo
const deleteWork = async (req, res) => {
  try {
    const trabajoEliminado = await Work.findByIdAndDelete(req.params.id);
    res.status(200).json(trabajoEliminado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al eliminar el trabajo' });
  }
};

// Generar PDF del trabajo
const generatePDF = async (req, res) => {
  try {
    const trabajo = await Work.findById(req.params.id);
    if (!trabajo) {
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

const getWorkOptions = (req, res) => {   
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
    createWork,    
    getWork,      
    updateWork,  
    deleteWork,  
    generatePDF, 
    getWorkOptions
  };
