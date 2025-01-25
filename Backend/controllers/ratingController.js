const db = require('../config/db');

const submitRating = async (req, res) => {
    const { student_id, meal_id, rating_score, feedback_text } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO rating (student_id, meal_id, rating_score, feedback_text) VALUES (?, ?, ?, ?)',
            [student_id, meal_id, rating_score, feedback_text]
        );

        res.status(201).json({ message: 'Rating submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getRatings = async (req, res) => {
    const { meal_id } = req.query;

    try {
        const [ratings] = await db.query(
            'SELECT * FROM rating WHERE meal_id = ?',
            [meal_id]
        );

        res.json(ratings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { submitRating, getRatings };