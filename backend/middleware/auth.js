// Authentication and Authorization Middleware

function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in first.' });
}

function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
}

module.exports = {
    requireAuth,
    requireAdmin
};
