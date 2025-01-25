const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    const { name, roll_no, email, password, mess_id } = req.body;

    try {
        // Check if email or roll_no already exists
        const [existingStudent] = await db.query(
            'SELECT * FROM student WHERE email = ? OR roll_no = ?',
            [email, roll_no]
        );

        if (existingStudent.length > 0) {
            return res.status(400).json({ error: 'Email or Roll No already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new student into the database
        const [result] = await db.query(
            'INSERT INTO student (name, roll_no, email, password_hash, mess_id) VALUES (?, ?, ?, ?, ?)',
            [name, roll_no, email, hashedPassword, mess_id]
        );

        // Generate a JWT token for the newly registered student
        const token = jwt.sign({ student_id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token and student_id in the response
        res.status(201).json({ message: 'Student registered successfully', token, student_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [students] = await db.query('SELECT * FROM student WHERE email = ?', [email]);
        if (students.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const student = students[0];
        const isPasswordValid = await bcrypt.compare(password, student.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ student_id: student.student_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Include the student_id in the response
        res.json({ token, student_id: student.student_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login };