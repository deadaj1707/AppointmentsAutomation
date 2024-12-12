const jwt = require('jsonwebtoken');
const User = require('../schema/Users');
const Availability = require('../schema/Availability');

// adds available slots
const addAvailability = async (req, res) => {
    const { date, slots } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; 

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

        // Create availability using the professor's ID from the token
        const availability = new Availability({
            professor: professor._id, // Use the professor's ObjectId
            date,
            slots,
        });
        await availability.save();

        res.status(201).json({ message: 'Availability added successfully', availability });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { addAvailability };
