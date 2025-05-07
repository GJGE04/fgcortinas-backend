const { createGoogleCalendarEvent, getGoogleCalendarEvents, deleteGoogleCalendarEvent, updateGoogleCalendarEvent, } = require('../services/googleCalendarService');

const addCalendarEvent = async (req, res) => {
  try {
    const { summary, description, start, end } = req.body;

    // Validación básica
    if (!summary || !start || !end) {
        return res.status(400).json({ message: 'Faltan campos requeridos: summary, start o end.' });
      }

      const eventData = {
        summary,
        description: description || '',
        start,
        end,
      };

    const event = await createGoogleCalendarEvent(eventData);
    return res.status(200).json({ message: '✅ Evento creado en Google Calendar', event });
  } catch (error) {
    console.error('❌ Error al crear el evento:', error);
    return res.status(500).json({
      message: 'Error al crear el evento en Google Calendar',
      error: error.message || error,
    });
  }
};

const getCalendarEvents = async (req, res) => {
    try {
      const events = await getGoogleCalendarEvents();
      return res.status(200).json({ events });
    } catch (error) {
      console.error('❌ Error al obtener eventos:', error);
      return res.status(500).json({
        message: 'Error al obtener eventos de Google Calendar',
        error: error.message || error,
      });
    }
  };

  // Eliminar un evento
  const deleteCalendarEvent = async (req, res) => {
    const { eventId } = req.params;
  
    try {
      const result = await deleteGoogleCalendarEvent(eventId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error al eliminar evento:', error);
      return res.status(500).json({
        message: 'Error al eliminar evento del calendario',
        error: error.message || error,
      });
    }
  };

  const updateCalendarEvent = async (req, res) => {
    const { eventId } = req.params;
    const { summary, description, start, end } = req.body;
  
    try {
      if (!summary || !start || !end) {
        return res.status(400).json({ message: 'Faltan campos requeridos: summary, start o end.' });
      }
  
      const updatedData = { summary, description, start, end };
      const updatedEvent = await updateGoogleCalendarEvent(eventId, updatedData);
  
      return res.status(200).json({ message: '✅ Evento actualizado', event: updatedEvent });
    } catch (error) {
      console.error('❌ Error al actualizar evento:', error);
      return res.status(500).json({
        message: 'Error al actualizar evento en Google Calendar',
        error: error.message || "No se pudo actualizar el evento.",
      });
    }
  };
  

module.exports = {
  addCalendarEvent,
  getCalendarEvents,
  deleteCalendarEvent,
  updateCalendarEvent,
};
