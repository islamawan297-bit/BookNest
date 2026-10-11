// Vercel Catch-All Serverless Function
// Natively catches all sub-routes under /api/* (e.g. /api/books, /api/auth/me, etc.)
const app = require('../backend/server');

module.exports = app;
