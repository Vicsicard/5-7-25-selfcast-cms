// Production server entry point
const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Create Express app
const app = express();

// Initialize Payload
const start = async () => {
  // Initialize Payload with all features
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'selfcast-studios-7af51d0c-ac48-4845-a41a',
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Redirect root to Admin panel
  app.get('/', (_, res) => {
    res.redirect('/admin');
  });

  // Health check endpoint
  app.get('/api/health', (_, res) => {
    res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    payload.logger.info(`Server started on port ${PORT}`);
    payload.logger.info(`Server URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${PORT}`}`);
    payload.logger.info(`Admin panel available at /admin`);
  });
};

start().catch((err) => {
  console.error('Error starting server:', err);
});
