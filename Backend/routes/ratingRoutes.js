const express = require('express');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

router.post('/submit', ratingController.submitRating);
router.get('/getRatingsByMeal', ratingController.getRatingsByMeal);

module.exports = router;