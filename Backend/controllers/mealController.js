const db = require('../config/db');

const getMeals = async (req, res) => {
    const { mess_id, day, meal_type } = req.query;

    try {
        const [meals] = await db.query(
            'SELECT * FROM meal WHERE mess_id = ? AND day = ? AND meal_type = ?',
            [mess_id, day, meal_type]
        );
        res.json(meals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getMeals };