const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', requireAdmin, bookController.createBook);
router.put('/:id', requireAdmin, bookController.updateBook);
router.delete('/:id', requireAdmin, bookController.deleteBook);

module.exports = router;
