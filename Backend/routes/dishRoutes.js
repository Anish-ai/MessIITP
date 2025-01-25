const express = require('express');
const dishController = require('../controllers/dishController');

const router = express.Router();

// GET /api/dishes - Fetch all dishes
router.get('/', dishController.getDishes);

module.exports = router;