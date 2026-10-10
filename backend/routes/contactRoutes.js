const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { requireAdmin } = require('../middleware/auth');

router.post('/', contactController.submitMessage);
router.get('/', requireAdmin, contactController.getAllMessages);
router.delete('/:id', requireAdmin, contactController.deleteMessage);

module.exports = router;
