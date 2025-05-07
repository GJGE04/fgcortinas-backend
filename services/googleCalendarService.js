const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/* version local v.1
const key = require('../config/google-service-account.json');        // ruta relativa al archivo .json
const auth = new google.auth.JWT(
    key.client_email,
    // serviceAccount.client_email,
    null,
    key.private_key,
    // serviceAccount.private_key,
    SCOPES
); */

/* version variables de entorno v.2
// 1. Tomamos el string de la variable de entorno
const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

// 2. Limpiamos los caracteres escapados
const cleaned = raw.replace(/\\"/g, '"').replace(/\\n/g, '\n');

// 3. Parseamos a JSON
const serviceAccountJson = JSON.parse(cleaned);

// 4. Creamos el auth con JWT
const auth = new google.auth.JWT(
  serviceAccountJson.client_email,
  null,
  serviceAccountJson.private_key,
  SCOPES
); */
/*
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  ['https://www.googleapis.com/auth/calendar']
); */

// version  v.3  para que funcione tanto en local como en producción (Render)

let auth;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  // ✅ Modo producción: cargamos el JSON desde variable de entorno
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  auth = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key.replace(/\\n/g, '\n'), // 👈 Importante
    SCOPES
  );
} else {
  // ✅ Modo local: cargamos desde archivo
  const key = require('../config/google-service-account.json');
  auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES
  );
}


/*
try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log('✅ JSON de cuenta de servicio cargado correctamente');
  } catch (err) {
    console.error('❌ Error al parsear GOOGLE_SERVICE_ACCOUNT_JSON:', err.message);
  }  */


// convertir un JSON en string escapado listo para usar en env
// const fs = require('fs');
/*
const raw = fs.readFileSync('./config/google-service-account.json', 'utf-8');
// const escaped = raw.replace(/\n/g, '\\n');
const escaped = JSON.stringify(JSON.parse(raw));
console.log("convertir un JSON en string escapado listo para usar en env...");
console.log(escaped);
console.log("FIN");
// Guardar en archivo
// fs.writeFileSync('./escaped-service-account.txt', escaped);
fs.writeFileSync('./escaped-service-account.json', escaped);
console.log("✅ JSON escapado guardado en 'escaped-service-account.txt'"); */

/*
let credentials;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    // Ejecutando en producción (el contenido del JSON está en una env var)
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON.replace(/\\n/g, '\n'));
  } else {
    // Ejecutando localmente desde el archivo
    const filePath = path.join(__dirname, '../config/google-service-account.json');
    credentials = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );  */

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
