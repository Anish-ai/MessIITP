const express = require('express');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

router.post('/', ratingController.submitRating);
router.get('/', ratingController.getRatings);

module.exports = router;