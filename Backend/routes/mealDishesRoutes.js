    const express = require('express');
    const mealDishesController = require('../controllers/mealDishesController');

    const router = express.Router();

    // GET /api/meal-dishes - Fetch dishes for a specific meal
    router.get('/', mealDishesController.getMealDishes);

    module.exports = router;