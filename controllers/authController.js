const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schema/Users');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET=process.env.JWT_SECRET;
// Sign-Up Functionality
const signup = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check for valid role
    if (!['student', 'professor'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, role: newUser.role });
    
};

// Log-In Functionality
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { signup, login };
