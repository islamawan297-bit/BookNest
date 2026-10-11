const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./config/db');
const DatabaseSessionStore = require('./config/sessionStore');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Trust reverse proxy (essential for Vercel HTTPS & secure session cookies)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Configuration (Database-backed for multi-lambda serverless persistence)
app.use(session({
    store: new DatabaseSessionStore(db),
    secret: process.env.SESSION_SECRET || 'bookhub_secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        secure: isProduction // Only require HTTPS in production
    }
}));

// URL Normalizer for Vercel Serverless Function invocations
// Vercel serverless functions in api/ can strip the '/api' prefix from req.url.
// This normalizes req.url back to '/api/...' so Express routes match predictably.
app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
        const pathOnly = req.url.split('?')[0];
        const isApiRoute = ['/books', '/auth', '/contact', '/orders', '/health'].some(
            prefix => pathOnly === prefix || pathOnly.startsWith(prefix + '/')
        );
        if (isApiRoute) {
            req.url = '/api' + req.url;
        }
    }
    next();
});

// Root API status endpoint
app.get(['/api', '/api/'], (req, res) => {
    res.json({
        success: true,
        message: 'BookHub REST API is operational',
        endpoints: ['/api/books', '/api/auth/me', '/api/health']
    });
});

// API Routes (Mounted on both /api/* and /* for maximum serverless compatibility)
app.use(['/api/auth', '/auth'], require('./routes/authRoutes'));
app.use(['/api/books', '/books'], require('./routes/bookRoutes'));
app.use(['/api/contact', '/contact'], require('./routes/contactRoutes'));
app.use(['/api/orders', '/orders'], require('./routes/orderRoutes'));

// Health & Environment Diagnostic Route
app.get(['/api/health', '/health'], (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        environment: isProduction ? 'production' : 'development',
        database: db.clientType,
        url: req.url,
        timestamp: new Date().toISOString()
    });
});

// Serve static frontend files (prefers public CDN folder, falls back to frontend)
const staticDir = fs.existsSync(path.join(__dirname, '../public'))
    ? path.join(__dirname, '../public')
    : path.join(__dirname, '../frontend');
app.use(express.static(staticDir, { extensions: ['html'] }));

// Handle 404 for unhandled API routes
app.use(['/api', '/api/*'], (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Fallback to index.html or 404.html for HTML page navigation
app.use((req, res) => {
    const errorPage = path.join(staticDir, '404.html');
    if (req.accepts('html') && fs.existsSync(errorPage)) {
        res.status(404).sendFile(errorPage);
    } else {
        res.status(404).json({ success: false, message: 'Resource not found.' });
    }
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// Export app for Vercel Serverless Function entry point
module.exports = app;

// Start Server when run directly (local development)
if (require.main === module) {
    app.listen(PORT, HOST, () => {
        console.log(`====================================================`);
        console.log(`🚀 BookHub Server running on http://localhost:${PORT}`);
        console.log(`====================================================`);
    });
}
