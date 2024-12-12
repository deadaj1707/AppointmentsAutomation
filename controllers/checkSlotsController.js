const jwt = require('jsonwebtoken');
const User = require('../schema/Users');
const Availability = require('../schema/Availability');

const checkAppointments = async (req, res) => {
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

        // Step 1: Fetch all availability records where the student has a booked slot
        const appointments = await Availability.find({
            'slots.student': student._id,
        }).select('date slots');

        // Step 2: Process each availability record to collect booked slots
        const result = [];
        for (const availability of appointments) {
            const filteredSlots = [];
            for (const slot of availability.slots) {
                // Check if the slot is booked by the student
                if (slot.student?.toString() === student._id.toString()) {
                    filteredSlots.push({ time: slot.time }); // Keep only the time
                }
            }

            // Add to the result if there are booked slots
            if (filteredSlots.length > 0) {
                result.push({
                    date: availability.date,
                    slots: filteredSlots,
                });
            }
        }


        res.status(200).json({
            message: 'Appointments retrieved successfully',
            appointments: result,
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { checkAppointments };
