    const express = require('express');
    const mealController = require('../controllers/mealController');

    const router = express.Router();

    // GET /api/meals - Fetch meals for a specific mess, day, and meal type
    router.get('/', mealController.getMeals);

    module.exports = router;