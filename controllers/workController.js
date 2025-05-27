const Work = require('../models/Work');
const Cliente = require('../models/Client');
const WORKSTATE = require('../config/workState');
const WORKTYPE = require('../config/workType');

// Obtener todos los trabajos
const getAllWorks = async (req, res) => {
  try {
    const works = await Work.find()
      .populate('cliente')      // trae datos del cliente. // Rellenar los datos de cliente
      .populate('tecnicos');

    res.status(200).json(works);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al obtener los trabajos' });
  }
};

// Obtener un solo trabajo por ID
const getWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('cliente')        // Para obtener datos del cliente (dirección, teléfono, etc.)
      .populate('tecnicos');      // Ahora es un array

    if (!work) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }

    res.json(work);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el trabajo' });
  }
};

// Crear un trabajo nuevo
const createWorkOld = async (req, res) => {
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

const createWork = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.body.cliente);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const now = new Date();  // hora actual

    const newWork = new Work({
      ...req.body,
      fechaCreacion: now,
      fechaUltimoEstado: now,
      fechaComienzo: req.body.fechaComienzo ? new Date(req.body.fechaComienzo) : null,
      fechaFinalizacion: req.body.fechaFinalizacion ? new Date(req.body.fechaFinalizacion) : null,
    });

    await newWork.save();
    res.status(201).json(newWork);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el trabajo' });
  }
};

// Actualizar un trabajo
const updateWorkOld = async (req, res) => {
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

// Actualizar un trabajo
const updateWork = async (req, res) => {
  try {
    const existingWork = await Work.findById(req.params.id);
    if (!existingWork) {
      return res.status(404).json({ message: 'Trabajo no encontrado' });
    }

    // Si el estado cambia, actualizamos fechaUltimoEstado
    if (req.body.estado && req.body.estado !== existingWork.estado) {
      req.body.fechaUltimoEstado = new Date();
    }

    // Convertimos fechas si vienen en el body
    if (req.body.fechaComienzo) {
      req.body.fechaComienzo = new Date(req.body.fechaComienzo);
    }
    if (req.body.fechaFinalizacion) {
      req.body.fechaFinalizacion = new Date(req.body.fechaFinalizacion);
    }

    const updatedWork = await Work.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedWork);
  } catch (error) {
    console.error('Error en updateWork:', error);
    res.status(500).json({ message: 'Error al actualizar el trabajo' });
  }
};

// Eliminar un trabajo
const deleteWork = async (req, res) => {
  try {
    // const trabajoEliminado = await Work.findByIdAndDelete(req.params.id);
    // res.status(200).json(trabajoEliminado);
    await Work.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Trabajo eliminado' });
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
  try {
    const tipoOptions = Object.values(WORKTYPE);
    const estadoOptions = Object.values(WORKSTATE);

    return res.status(200).json({
      tipo: tipoOptions,
      estado: estadoOptions
    });

  } catch (error) {
    console.error('Error al obtener opciones de trabajo:', error);
    return res.status(500).json({ message: 'Error al obtener opciones de trabajo' });
  }
};

const getWorkOptionsKV = (req, res) => {
  try {
    const tipoOptions = Object.entries(WORKTYPE).map(([key, value]) => ({
      key,
      value
    }));

    const estadoOptions = Object.entries(WORKSTATE).map(([key, value]) => ({
      key,
      value
    }));

    return res.status(200).json({
      tipo: tipoOptions,
      estado: estadoOptions
    });

  } catch (error) {
    console.error('Error al obtener opciones de trabajo:', error);
    return res.status(500).json({ message: 'Error al obtener opciones de trabajo' });
  }
};

const getWorkOptionsOld = (req, res) => {   
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
  
    // Devolver las opciones de tipo y estado como una respuesta JSON
    return res.status(200).json({
      tipo: tipoOptions,
      estado: estadoOptions
    });
  } catch (error) {
    console.error('Error en getWorkOptions:', error);
    return res.status(500).json({ message: 'Error al obtener opciones de trabajo' });
  }
};

module.exports = {
    createWork,    
    getWork,      
    updateWork,  
    deleteWork,  
    generatePDF, 
    getWorkOptions,
    getWorkOptionsKV,
    getAllWorks
  };
