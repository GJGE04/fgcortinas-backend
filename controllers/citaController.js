const Cita = require('../models/Cita');
// const Cliente = require('../models/Cliente');
// const Tecnico = require('../models/Tecnico');
const formatearDescripcionGoogle = require('../utils/formatearDescripcionGoogle');

const {
    createGoogleCalendarEvent,
    updateGoogleCalendarEvent,
    deleteGoogleCalendarEvent,
  } = require('../services/googleCalendarService');  

// ✅ Función reutilizable para obtener una cita con todos sus datos relacionados
const populateCita = async (citaId) => {
    return await Cita.findById(citaId)
      .populate('cliente', 'nombre telefono email')
      .populate('tecnicos', 'nombre especialidad')
      .populate('trabajoAsociado', 'titulo descripcion');
};

const createCita = async (req, res) => {
    console.log("📥 Datos recibidos para nueva cita:", req.body);
    try {
      const {
        direccion,
        telefono,
        tipo,
        tecnicos,
        cliente,
        trabajoAsociado,
        fechaInicio,
        fechaFin,
        sincronizarGoogleCalendar = true, // por defecto en true
      } = req.body;
  
      // Validación rápida
      if (!tipo || !tecnicos?.length || !cliente || !fechaInicio || !fechaFin) {    // !direccion || 
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }
  
      let googleEventId = null;
      let googleCalendarWarning = null;
  
      if (sincronizarGoogleCalendar) {
        try {
            const descripcion = await formatearDescripcionGoogle({
                direccion,
                clienteId: cliente,
                tecnicosIds: tecnicos,
                tipo
              });

          const eventoGoogle = await createGoogleCalendarEvent({
            // summary: `${tipo} - Cliente`, // o `${tipo} - ${nombreCliente}`
            // description: `Dirección: ${direccion}`,
            summary: `${tipo} - ${clienteData?.nombre || "Cliente"}`,
            description,
            start: fechaInicio,
            end: fechaFin,
          });
  
          googleEventId = eventoGoogle?.id;
        } catch (error) {
          console.error('⚠️ Error al crear evento en Google Calendar:', error.message);
          googleCalendarWarning = error.message || 'Error desconocido al crear el evento en Google Calendar';
        }
      }
  
      const nuevaCita = new Cita({
        direccion: direccion || "", // o directamente omitir si no se requiere
        telefono,
        tipo,
        tecnicos,
        cliente,
        trabajoAsociado: trabajoAsociado || null,
        fechaInicio,
        fechaFin,
        googleEventId,
        source: "sistema", // 👈 importante
      });
  
      const citaGuardada = await nuevaCita.save();
      const citaConDatos = await populateCita(citaGuardada._id);
  
      const response = {
        message: '✅ Cita creada correctamente',
        cita: citaConDatos,
      };
  
      if (googleCalendarWarning) {
        response.googleCalendarWarning = true;
        response.message += ', pero ocurrió un error al crear el evento en Google Calendar';
        response.error = googleCalendarWarning;
      }
  
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ Error al crear la cita:', error);
      res.status(500).json({
        message: 'Error al guardar la cita',
        error: error.message || error,
      });
    }
  };  

  const updateCita = async (req, res) => {
    const { id } = req.params;
    const {
        direccion,
        telefono,
        tipo,
        tecnicos,
        cliente,
        trabajoAsociado,
        fechaInicio,
        fechaFin,
        sincronizarGoogleCalendar = true,
    } = req.body;

    try {
        const cita = await Cita.findById(id);
        if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

        const clienteData = await Cliente.findById(cliente); // o cita.cliente si ya está poblado
        const tecnicosData = await Tecnico.find({ _id: { $in: tecnicos } });

        const descripcion = `
        📍 Dirección: ${direccion || "No especificada"}
        👤 Cliente: ${clienteData?.nombre || "Sin nombre"}
        📞 Teléfono: ${clienteData?.telefono || "Sin teléfono"}
        👷 Técnicos: ${tecnicosData.map(t => t.nombre).join(", ")}
        📌 Tipo: ${tipo}
        `.trim();


        // ✅ Asegurar que source esté presente (compatibilidad con datos antiguos)
        if (!cita.source) {
            cita.source = "sistema";
        }

        // Actualizar campos
        cita.direccion = direccion || "", // o directamente omitir si no se requiere
        cita.telefono = telefono;
        cita.tipo = tipo;
        cita.tecnicos = tecnicos;
        cita.cliente = cliente;
        cita.trabajoAsociado = trabajoAsociado;
        cita.fechaInicio = fechaInicio;
        cita.fechaFin = fechaFin;

        let googleCalendarWarning = null;

        // 🔄 Google Calendar sync
        if (sincronizarGoogleCalendar) {
            try{
                if (cita.googleEventId) {
                    await updateGoogleCalendarEvent(cita.googleEventId, {
                        summary: `${tipo} - ${clienteData?.nombre || "Cliente"}`,
                        description,
                        start: fechaInicio,
                        end: fechaFin,
                    });
                  } else {
                    const nuevoEvento = await createGoogleCalendarEvent({
                      summary: `${tipo} - Cliente`,
                      description: `Dirección: ${direccion}`,
                      start: fechaInicio,
                      end: fechaFin,
                    });
                    cita.googleEventId = nuevoEvento.id;
                }
            } catch (error) {
                console.error("⚠️ Error al sincronizar con Google Calendar:", error.message);
                googleCalendarWarning = error.message || 'Error desconocido al sincronizar con Google Calendar';
            }
        }

        await cita.save();
        // res.json({ message: '✅ Cita actualizada correctamente', cita });

        const citaActualizada = await populateCita(id);
        const response = {
            message: '✅ Cita actualizada correctamente',
            cita: citaActualizada,
        };

        if (googleCalendarWarning) {
            response.googleCalendarWarning = true;
            response.message += ', pero ocurrió un error al actualizar el evento en Google Calendar';
            response.error = googleCalendarWarning;
        }
/*
        const citaActualizada = await Cita.findById(id)
        .populate('cliente', 'nombre telefono email')
        .populate('tecnicos', 'nombre especialidad')
        .populate('trabajoAsociado', 'titulo descripcion'); */

        
        // res.json({ message: '✅ Cita actualizada correctamente', cita: citaActualizada });
        // response.cita = citaActualizada;
        return res.json(response);

    } catch (error) {
        console.error(`❌ Error al actualizar la cita ${id}:`, error);
        res.status(500).json({ message: 'Error al actualizar la cita', error });
    }
  };

  const deleteCita = async (req, res) => {
    const { id } = req.params;
  
    try {
      const cita = await Cita.findById(id);
      if (!cita) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }
  
      let googleCalendarWarning = null;
  
      // 🗑️ Intentar eliminar el evento de Google Calendar
      // ✅ Solo intentamos borrar si tiene googleEventId y fue creada por el sistema
        if (cita.googleEventId && cita.source !== "google") {
            try {
            await deleteGoogleCalendarEvent(cita.googleEventId);
            } catch (error) {
            console.error("⚠️ Error al eliminar evento de Google Calendar:", error.message);
            googleCalendarWarning = error.message || "Error al eliminar evento en Google Calendar";
            }
        }
  
      // 🧹 Eliminar cita de la base de datos
      // await Cita.findByIdAndDelete(id);
      await cita.deleteOne();
  
      const response = {
        message: '✅ Cita eliminada correctamente',
      };
  
      if (googleCalendarWarning) {
        response.googleCalendarWarning = true;
        response.message += ', pero falló la eliminación del evento en Google Calendar';
        response.error = googleCalendarWarning;
      }
  
      return res.status(200).json(response);
    } catch (error) {
      console.error('❌ Error al eliminar la cita:', error);
      return res.status(500).json({
        message: 'Error al eliminar la cita',
        error: error.message || error,
      });
    }
  };  

  const getCitas = async (req, res) => {
    try {
      const { desde, hasta, cliente, tecnico, tipo, limit, skip } = req.query;
  
      const filtros = {};
  
      // 📆 Rango de fechas
      if (desde || hasta) {
        filtros.fechaInicio = {};
        if (desde) {
          const desdeDate = new Date(desde);
          if (!isNaN(desdeDate)) filtros.fechaInicio.$gte = desdeDate;
        }
        if (hasta) {
          const hastaDate = new Date(hasta);
          if (!isNaN(hastaDate)) filtros.fechaInicio.$lte = hastaDate;
        }
      }
  
      // 🔎 Filtros adicionales
      if (cliente) filtros.cliente = cliente;
      if (tecnico) filtros.tecnicos = tecnico;
      if (tipo) filtros.tipo = tipo;
  
      const citas = await Cita.find(filtros)
        .populate('cliente', 'nombre telefono email')
        .populate('tecnicos', 'nombre especialidad')
        .populate('trabajoAsociado', 'titulo descripcion')
        .sort({ fechaInicio: 1 })       // opcional: ordenadas por fecha
        .skip(parseInt(skip) || 0)
        .limit(parseInt(limit) || 100);
  
      res.json(citas);
    } catch (error) {
      console.error('❌ Error al filtrar citas:', error);
      res.status(500).json({ message: 'Error al obtener las citas', error });
    }
  };  

  module.exports = {
    createCita,
    updateCita,
    deleteCita,
    getCitas
  };