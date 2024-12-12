const jwt = require('jsonwebtoken');
const User = require('../schema/Users');
const Availability = require('../schema/Availability');

const bookAvailableSlots = async (req, res) => {
    const { professorName, date, time } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is required' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure the user is a student
        const student = await User.findById(decoded.id);
        if (!student || student.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Not a student' });
        }

        // Check if the professor exists and their role is valid
        const professor = await User.findOne({ name: professorName });
        if (!professor || professor.role !== 'professor') {
            return res.status(404).json({ message: 'Professor not found' });
        }

        // Fetch availability for the professor on the specified date
        const availability = await Availability.findOne({ professor: professor._id, date });
        console.log("Availability found:", availability);

        if (!availability || !availability.slots || !Array.isArray(availability.slots)) {
            return res.status(404).json({ message: 'No availability found for the specified date' });
        }

        // Find the requested time slot
        const slot = availability.slots.find(s => s.time === time && !s.isBooked);
        console.log("Slot found:", slot);

        if (!slot) {
            return res.status(400).json({ message: 'Time slot not available or already booked' });
        }

        // Book the slot
        slot.isBooked = true;
        slot.student = student._id;
        await availability.save();

        res.status(200).json({
            message: 'Appointment booked successfully',
            slot: { time: slot.time, student: student.name },
        });

    } catch (error) {
        console.error("Error while booking appointment:", error); // Log the error for debugging
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { bookAvailableSlots };
