const express = require('express');
const rolesController = require('../controllers/rolesController');

const router = express.Router();

router.get('/', rolesController.getRoles);
router.post('/', rolesController.addOrUpdateRole);
router.delete('/:email', rolesController.deleteRole);

module.exports = router;