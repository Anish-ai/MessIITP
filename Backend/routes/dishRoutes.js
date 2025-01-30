const express = require('express');
const dishController = require('../controllers/dishController');

const router = express.Router();

// GET /api/dishes - Fetch all dishes
router.get('/', dishController.getDishes);
router.get('/search', dishController.getDishByName);
router.get('/partialSearch', dishController.getDishesByPartialName);
router.post('/', dishController.insertNewDish);

module.exports = router;