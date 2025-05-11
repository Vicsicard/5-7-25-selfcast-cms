/**
 * Standard Payload CMS Server Configuration
 * Following the official Payload CMS documentation
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
    // Initialize Payload with standard configuration
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.MONGODB_URI,
      express: app,
      onInit: async () => {
        payload.logger.info(`Payload CMS initialized successfully`);
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

    // Bind to the port specified by Render
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      payload.logger.info(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
start();
