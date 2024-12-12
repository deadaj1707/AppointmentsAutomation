const jwt = require('jsonwebtoken');
const User = require('../schema/Users');
const Availability = require('../schema/Availability');

// Student views available slots for a professor
const viewAvailableSlots = async (req, res) => {
    const { professorName } = req.query; // Fetch professorId from query parameters
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

        // Fetch availability for the professor
        const availability = await Availability.find({ professor: professor._id });

        res.status(200).json({
            message: 'Available slots retrieved successfully',
            availability,
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { viewAvailableSlots };
