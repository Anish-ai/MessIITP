const db = require('../config/db');

const getStudentDetails = async (req, res) => {
    const { student_id } = req.params;

    try {
        const [students] = await db.query('SELECT * FROM student WHERE student_id = ?', [student_id]);
        if (students.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = students[0];
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getStudentDetails };