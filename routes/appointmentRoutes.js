const express = require('express');
const router = express.Router();
const {bookAvailableSlots}=require('../controllers/bookSlotsController');
const {checkAppointments}= require('../controllers/checkSlotsController');
const {cancelAppointment} = require('../controllers/cancelSlotsController');
// Route to add availability (only for professors)
router.post('/book', bookAvailableSlots);

// Route to view available slots for a professor (for students)
router.get('/check', checkAppointments);

router.put('/cancel',cancelAppointment);
module.exports = router;
