const { google } = require('googleapis');
const path = require('path');
const key = require('../config/google-service-account.json'); // ruta relativa al archivo .json

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const auth = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  SCOPES
);

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Crea un evento en Google Calendar con las fechas en formato ISO.
 * @param {Object} eventData
 * @param {string} eventData.summary - Título del evento
 * @param {string} eventData.description - Descripción
 * @param {string} eventData.start - Fecha y hora inicio en formato ISO
 * @param {string} eventData.end - Fecha y hora fin en formato ISO
 */

const createGoogleCalendarEvent = async (eventData) => {
  // Validar formato ISO
  if (!eventData.start || !eventData.end) {
    throw new Error('start y end son obligatorios');
  }

  const event = {
    summary: eventData.summary,
    description: eventData.description,
    start: {
      dateTime: eventData.start,    // Debe ser una string ISO válida
      timeZone: 'America/Argentina/Buenos_Aires',
    },
    end: {
      dateTime: eventData.end,      // También una string ISO
      timeZone: 'America/Argentina/Buenos_Aires',
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'oficinafgcortinas@gmail.com',
      resource: event,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear el evento en Google Calendar:', error.errors || error.message);
    throw error;
  }
};

/**
 * Obtiene los eventos futuros desde Google Calendar
 */
const getGoogleCalendarEvents = async () => {
    try {
      const response = await calendar.events.list({
        calendarId: 'oficinafgcortinas@gmail.com',
        // timeMin: new Date().toISOString(),  // Esto filtra solo eventos futuros
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      return response.data.items;
    } catch (error) {
      console.error('❌ Error al obtener eventos de Google Calendar:', error.errors || error.message);
      throw error;
    }
  };

  /**
 * Elimina un evento de Google Calendar por ID
 * @param {string} eventId - ID del evento a eliminar
 */
const deleteGoogleCalendarEvent = async (eventId) => {
    if (!eventId) {
      throw new Error('Se requiere un eventId válido');
    }
  
    try {
      // Eliminar el evento usando la API de Google Calendar
      await calendar.events.delete({
        calendarId: 'oficinafgcortinas@gmail.com',
        eventId,
      });
      return { message: 'Evento eliminado correctamente' };
    } catch (error) {
      console.error('❌ Error al eliminar el evento en Google Calendar:', error.errors || error.message);
      throw error;
    }
  };

  /**
 * Actualiza un evento existente en Google Calendar
 * @param {string} eventId - ID del evento a actualizar
 * @param {Object} updatedData - Nuevos datos del evento
 */
const updateGoogleCalendarEvent = async (eventId, updatedData) => {
    if (!eventId || !updatedData) {
      throw new Error('Se requiere eventId y datos actualizados');
    }

    // 🛑 Validación: end debe ser posterior a start
    const startDate = new Date(updatedData.start);
    const endDate = new Date(updatedData.end);

    if (endDate <= startDate) {
        throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
    }
  
    const event = {
      summary: updatedData.summary,
      description: updatedData.description || '',
      start: {
        dateTime: updatedData.start,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: updatedData.end,
        timeZone: 'America/Argentina/Buenos_Aires',
      },
    };
  
    try {
      const response = await calendar.events.update({
        calendarId: 'oficinafgcortinas@gmail.com',
        eventId,
        resource: event,
      });
  
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar evento en Google Calendar:', error.errors || error.message);
      throw error;
    }
  };
  

module.exports = {
  createGoogleCalendarEvent,
  getGoogleCalendarEvents, 
  deleteGoogleCalendarEvent,
  updateGoogleCalendarEvent,
};
