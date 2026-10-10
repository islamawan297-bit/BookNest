const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { requireAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.get('/users', requireAdmin, authController.getAllUsers);
router.delete('/users/:id', requireAdmin, authController.deleteUser);

module.exports = router;
