const db = require('../config/db');

const getDishes = async (req, res) => {
    try {
        const [dishes] = await db.query('SELECT * FROM dishes');
        res.json(dishes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getDishes };