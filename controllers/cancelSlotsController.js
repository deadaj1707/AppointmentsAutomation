const jwt = require('jsonwebtoken');
const User = require('../schema/Users');
const Availability = require('../schema/Availability');

const cancelAppointment = async (req, res) => {
    const { date, time } = req.body; // Date and time slot
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure the user is a professor
        const professor = await User.findById(decoded.id);
        if (!professor || professor.role !== 'professor') {
            return res.status(403).json({ message: 'Access denied. Not a professor' });
        }

        // Find availability for the professor on the specified date
        const availability = await Availability.findOne({ professor: professor._id, date });
        if (!availability) {
            return res.status(404).json({ message: 'No availability found for the specified date' });
        }

        // Find the requested time slot
        const slot = availability.slots.find(s => s.time === time && s.isBooked);
        if (!slot) {
            return res.status(400).json({ message: 'No booked appointment found for the specified time slot' });
        }

        // Cancel the appointment
        slot.isBooked = false;
        slot.student = null;
        await availability.save();

        res.status(200).json({
            message: 'Appointment cancelled successfully',
            slot: { time: slot.time },
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { cancelAppointment };
