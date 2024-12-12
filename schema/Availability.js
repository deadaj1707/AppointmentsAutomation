const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    slots: [
        {
            time: { type: String, required: true },
            isBooked: { type: Boolean, default: false },
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Store student ID
        },
    ],
});

module.exports = mongoose.model('Availability', availabilitySchema);
