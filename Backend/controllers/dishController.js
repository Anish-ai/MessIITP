const db = require('../config/db');

const getDishes = async (req, res) => {
    try {
        const [dishes] = await db.query('SELECT * FROM dishes');
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDishByName = async (req, res) => {
    const { dish_name } = req.query;
    try {
        const [dishes] = await db.query('SELECT * FROM dishes WHERE dish_name = ?', [dish_name]);
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const insertNewDish = async (req, res) => {
    const { dish_name, type } = req.body;
    try {
        const [result] = await db.query('INSERT INTO dishes (dish_name, type) VALUES (?, ?)', [dish_name, type]);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDishesByPartialName = async (req, res) => {
    const { dish_name } = req.query;
    try {
        const [dishes] = await db.query('SELECT * FROM dishes WHERE dish_name LIKE ?', [`%${dish_name}%`]);
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getDishes, getDishByName, insertNewDish, getDishesByPartialName };