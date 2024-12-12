const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const availabilityRoutes=require('./routes/availabilityRoutes');
const appointmentRoutes =require('./routes/appointmentRoutes');
dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use('/api/appointment',appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;