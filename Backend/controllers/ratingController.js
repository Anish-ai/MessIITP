// Backend/controllers/ratingController.js
const db = require('../config/db');

const submitRating = async (req, res) => {
    const { student_id, meal_id, rating_date, rating_score, feedback_text } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO rating (student_id, meal_id, rating_date, rating_score, feedback_text) VALUES (?, ?, ?, ?, ?)',
            [student_id, meal_id, rating_date, rating_score, feedback_text]
        );

        res.status(201).json({ message: 'Rating submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRatingsByMeal = async (req, res) => {
    const { meal_id } = req.query;

    try {
        const [ratings] = await db.query(
            'SELECT rating_score FROM rating WHERE meal_id = ?', [meal_id]);
        if (ratings.length === 0) {
            return res.status(404).json({ error: 'No ratings found' });
        }
        const totalRatings = ratings.length;
        let totalScore = 0;
        for (const rating of ratings) {
            totalScore += rating.rating_score;
        }
        const averageRating = totalScore / totalRatings;

        res.json({ averageRating });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRatingByMealAndDate = async (req, res) => {
    const { meal_id, rating_date } = req.query;

    try {
        const [ratings] = await db.query(
            'SELECT rating_score FROM rating WHERE meal_id = ? AND rating_date = ?', [meal_id, rating_date]);
        if (ratings.length === 0) {
            return res.status(404).json({ error: 'No ratings found' });
        }

        const totalRatings = ratings.length;
        let totalScore = 0;
        for (const rating of ratings) {
            totalScore += rating.rating_score;
        }
        
        const averageRating = totalScore / totalRatings;
        res.json({ averageRating });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRatingsByMealAndMess = async (req, res) => {
    const { mess_id, meal_type, days } = req.query;

    try {
        // Calculate the date range for the past 'days' days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (days - 1));

        // Format dates to YYYY-MM-DD
        const formatDate = (date) => date.toISOString().split('T')[0];

        // Fetch all meals for the specified mess and meal type within the date range
        const [meals] = await db.query(
            'SELECT meal_id FROM meal WHERE mess_id = ? AND meal_type = ? AND day IN (?)',
            [mess_id, meal_type, ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']]
        );

        if (meals.length === 0) {
            return res.status(404).json({ error: 'No meals found for the specified mess and meal type' });
        }

        const mealIds = meals.map(meal => meal.meal_id);

        // Fetch ratings for the fetched meal IDs within the date range
        const [ratings] = await db.query(
            'SELECT meal_id, rating_date, rating_score FROM rating WHERE meal_id IN (?) AND rating_date BETWEEN ? AND ?',
            [mealIds, formatDate(startDate), formatDate(endDate)]
        );

        if (ratings.length === 0) {
            return res.status(404).json({ error: 'No ratings found for the specified meals and date range' });
        }

        // Group ratings by date and calculate average ratings for each date
        const ratingsByDate = {};

        ratings.forEach(rating => {
            const date = formatDate(new Date(rating.rating_date)); // Format the date as YYYY-MM-DD
            if (!ratingsByDate[date]) {
                ratingsByDate[date] = { totalScore: 0, count: 0 };
            }
            ratingsByDate[date].totalScore += rating.rating_score;
            ratingsByDate[date].count += 1;
        });

        // Convert to an array of objects with formatted dates
        const averageRatings = Object.keys(ratingsByDate).map(date => ({
            date,
            averageRating: ratingsByDate[date].totalScore / ratingsByDate[date].count,
        }));

        // Sort by date
        averageRatings.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({ averageRatings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { submitRating, getRatingsByMeal, getRatingByMealAndDate, getRatingsByMealAndMess };