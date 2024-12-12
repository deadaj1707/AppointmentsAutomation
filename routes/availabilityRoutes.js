const express = require('express');
const router = express.Router();
const {addAvailability}=require('../controllers/addSlotsController');
const {viewAvailableSlots}= require('../controllers/viewSlotsController');

// Route to add availability (only for professors)
router.post('/add', addAvailability);

// Route to view available slots for a professor (for students)
router.get('/view', viewAvailableSlots);

module.exports = router;
