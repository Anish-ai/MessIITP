const express = require('express');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

router.post('/submit', ratingController.submitRating);
router.get('/getRatingsByMeal', ratingController.getRatingsByMeal);
router.get('/getRatingByMealAndDate', ratingController.getRatingByMealAndDate);
router.get('/getRatingsByMealAndMess', ratingController.getRatingsByMealAndMess);

module.exports = router;