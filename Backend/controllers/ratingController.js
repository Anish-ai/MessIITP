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

module.exports = { submitRating, getRatingsByMeal };