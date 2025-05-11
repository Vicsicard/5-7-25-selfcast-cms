/**
 * This is a minimal server setup for Payload CMS
 * Following best practices for middleware order and configuration
 */

const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Create Express app
const app = express();

// Add health check endpoint before Payload initialization
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const start = async () => {
  // Set SERVER_URL environment variable if not set
  if (!process.env.SERVER_URL) {
    process.env.SERVER_URL = 'https://selfcast-cms-admin.onrender.com';
    console.log(`Setting SERVER_URL to ${process.env.SERVER_URL}`);
  }

  // Initialize Payload with minimal configuration
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload CMS initialized successfully`);
      payload.logger.info(`Admin URL: ${process.env.SERVER_URL}/admin`);
    },
  });

  // Add a simple test API endpoint
  app.get('/api/test', (req, res) => {
    res.json({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString()
    });
  });

  // Redirect root to admin panel
  app.get('/', (_, res) => {
    res.redirect('/admin');
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    payload.logger.info(`Server started on port ${PORT}`);
  });
};

start();
