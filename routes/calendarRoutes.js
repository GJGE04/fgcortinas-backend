const express = require('express');
const router = express.Router();
const { addCalendarEvent, getCalendarEvents, deleteCalendarEvent, updateCalendarEvent } = require('../controllers/calendarController');

router.post('/create-event', addCalendarEvent);
router.get('/events', getCalendarEvents);
router.delete('/delete-event/:eventId', deleteCalendarEvent);
router.put('/update-event/:eventId', updateCalendarEvent);

module.exports = router;
