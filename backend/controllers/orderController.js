const db = require('../config/db');

// Place order (User)
exports.createOrder = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { book_id, quantity, shipping_address, payment_method } = req.body;

        if (!book_id || !quantity || !shipping_address) {
            return res.status(400).json({ success: false, message: 'Book ID, quantity, and shipping address are required.' });
        }

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid quantity.' });
        }

        const book = await db.getAsync('SELECT * FROM books WHERE id = ?', [book_id]);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found.' });
        }

        if (book.stock < qty) {
            return res.status(400).json({ success: false, message: `Only ${book.stock} copies remaining in stock.` });
        }

        const totalPrice = (book.price * qty).toFixed(2);

        const result = await db.runAsync(
            `INSERT INTO orders (user_id, book_id, quantity, total_price, shipping_address, payment_method, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, book_id, qty, totalPrice, shipping_address.trim(), payment_method || 'Credit Card', 'Processing']
        );

        // Deduct stock
        await db.runAsync('UPDATE books SET stock = stock - ? WHERE id = ?', [qty, book_id]);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId: result.lastID,
            totalPrice
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order.' });
    }
};

// Get current user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orders = await db.allAsync(
            `SELECT orders.*, books.title as book_title, books.author as book_author, books.cover_image 
             FROM orders 
             JOIN books ON orders.book_id = books.id 
             WHERE orders.user_id = ? 
             ORDER BY orders.id DESC`,
            [userId]
        );

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
    }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await db.allAsync(
            `SELECT orders.*, users.name as user_name, users.email as user_email, books.title as book_title 
             FROM orders 
             JOIN users ON orders.user_id = users.id 
             JOIN books ON orders.book_id = books.id 
             ORDER BY orders.id DESC`
        );

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve all orders.' });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required.' });
        }

        await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        res.json({ success: true, message: `Order status updated to '${status}'.` });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};
