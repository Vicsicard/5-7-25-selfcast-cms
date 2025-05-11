/**
 * Standard Payload CMS Server Configuration
 * Based on official examples for production deployments
 */

const express = require('express');
const payload = require('payload');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();

// Health check endpoint (before Payload initialization)
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

  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
  });

  // Add a simple test API endpoint
  app.get('/api/test', (req, res) => {
    res.json({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString()
    });
  });

  // Serve static admin assets
  const adminDir = path.resolve(__dirname, '../build/admin');
  app.use('/admin', express.static(adminDir));

  // Redirect root to admin panel
  app.get('/', (_, res) => {
    res.redirect('/admin');
  });

  // Bind to the port specified by Render
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

// Start the server
start();
