const db = require('../config/db');

const registerMess = async (req, res) => {
    const { mess_id, mess_name } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO mess (mess_id, mess_name) VALUES (?, ?)',
            [mess_id, mess_name]
        );

        res.status(201).json({ message: 'Mess registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllMesses = async (req, res) => {
    try {
        const [messes] = await db.query('SELECT mess_id, mess_name FROM mess');
        res.json(messes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerMess, getAllMesses };