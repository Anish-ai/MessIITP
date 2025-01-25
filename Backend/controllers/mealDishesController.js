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

module.exports = { getMealDishes };