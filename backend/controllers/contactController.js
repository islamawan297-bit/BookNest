const db = require('../config/db');

// Submit contact form message
exports.submitMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All contact fields are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        const result = await db.runAsync(
            'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Thank you for reaching out! Your message has been sent successfully.',
            messageId: result.lastID
        });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
};

// Get all messages (Admin only)
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await db.allAsync('SELECT * FROM messages ORDER BY id DESC');
        res.json({ success: true, count: messages.length, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
    }
};

// Delete a message (Admin only)
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await db.runAsync('DELETE FROM messages WHERE id = ?', [id]);
        res.json({ success: true, message: 'Message deleted successfully.' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message.' });
    }
};
