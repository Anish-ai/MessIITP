require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const studentRoutes = require('./routes/studentRoutes');
const messRoutes = require('./routes/messRoutes');
const dishRoutes = require('./routes/dishRoutes');
const mealRoutes = require('./routes/mealRoutes');
const mealDishesRoutes = require('./routes/mealDishesRoutes');
const rolesRoutes = require('./routes/rolesRoutes');

const app = express();

// Debug environment variables
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

// Middleware
app.use(cors({
    origin: ['http://10.16.2.60:19006', 'http://localhost:19006','http://10.16.3.240:19006'], // Add more origins as needed
    credentials: true,
}));
app.use(express.json());

// Debug logs
console.log('Middleware and routes loaded.');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/meal-dishes', mealDishesRoutes);
app.use('/api/roles', rolesRoutes);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;