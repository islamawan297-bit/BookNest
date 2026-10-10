const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', requireAuth, orderController.createOrder);
router.get('/my-orders', requireAuth, orderController.getMyOrders);
router.get('/', requireAdmin, orderController.getAllOrders);
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus);

module.exports = router;
