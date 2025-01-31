const express = require('express');
const messController = require('../controllers/messController');

const router = express.Router();

router.post('/registerMess', messController.registerMess);
router.get('/all', messController.getAllMesses);

module.exports = router;  // Ensure this line is present