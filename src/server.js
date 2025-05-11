/**
 * Basic Payload CMS Server Configuration
 * Following official Payload CMS documentation for production deployments
 */

const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Create Express app
const app = express();

// Health check endpoint (before Payload initialization)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const start = async () => {
  try {
    // Set SERVER_URL environment variable if not set
    if (!process.env.SERVER_URL) {
      process.env.SERVER_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://selfcast-cms-admin.onrender.com';
      console.log(`Setting SERVER_URL to ${process.env.SERVER_URL}`);
    }

    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.MONGODB_URI,
      express: app,
      onInit: async () => {
        payload.logger.info(`Payload initialized successfully`);
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

    // Bind to the port specified by Render (IMPORTANT: bind to 0.0.0.0)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      payload.logger.info(`Server started on port ${PORT}`);
      payload.logger.info(`Server bound to 0.0.0.0 (all interfaces) as required by Render`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
start();
