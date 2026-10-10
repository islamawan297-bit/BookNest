const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Server-side Validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields (name, email, password) are required.' });
        }

        const trimmedEmail = email.trim().toLowerCase();
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
        }

        // Check if user already exists
        const existingUser = await db.getAsync('SELECT id FROM users WHERE email = ?', [trimmedEmail]);
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email is already registered. Please login.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await db.runAsync(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name.trim(), trimmedEmail, hashedPassword, 'user']
        );

        const newUser = {
            id: result.lastID,
            name: name.trim(),
            email: trimmedEmail,
            role: 'user'
        };

        // Save to session
        req.session.user = newUser;

        return res.status(201).json({
            success: true,
            message: 'Registration successful!',
            user: newUser
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [trimmedEmail]);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        req.session.user = sessionUser;

        return res.json({
            success: true,
            message: 'Login successful!',
            user: sessionUser
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};

// Logout user
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Logged out successfully.' });
    });
};

// Get current session user
exports.getMe = (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ success: true, user: req.session.user });
    }
    return res.status(401).json({ success: false, user: null, message: 'Not logged in' });
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.allAsync('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const targetId = parseInt(id);

        if (targetId === req.session.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
        }

        const existingUser = await db.getAsync('SELECT id FROM users WHERE id = ?', [targetId]);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        await db.runAsync('DELETE FROM users WHERE id = ?', [targetId]);

        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user.' });
    }
};
