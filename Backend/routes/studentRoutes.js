const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

// GET /api/students/:student_id - Fetch student details
router.get('/:student_id', studentController.getStudentDetails);
router.put('/:student_id/mess', studentController.updateStudentMess);

module.exports = router;