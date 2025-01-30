const db = require('../config/db');

const getMealDishes = async (req, res) => {
    const { meal_id } = req.query;

    try {
        const [dishes] = await db.query(
            `SELECT d.dish_id, d.dish_name, d.type 
             FROM meal_dishes md
             JOIN dishes d ON md.dish_id = d.dish_id
             WHERE md.meal_id = ?`,
            [meal_id]
        );
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteMealDish = async (req, res) => {
    const { meal_id } = req.params;
    try {
        await db.query('DELETE FROM meal_dishes WHERE meal_id = ?', [meal_id]);
        res.json({ message: 'Meal dishes deleted!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const insertNewMealDish = async (req, res) => {
    const { meal_id, dish_id } = req.body;
    try {
        const [result] = await db.query('INSERT INTO meal_dishes (meal_id, dish_id) VALUES (?, ?)', [meal_id, dish_id]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getMealDishes, deleteMealDish, insertNewMealDish };