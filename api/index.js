// Vercel Serverless Function Entry Point
// Bridges incoming requests directly to the Express application
const app = require('../backend/server');

module.exports = app;
