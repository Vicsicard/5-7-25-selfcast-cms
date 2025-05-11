// Minimal Payload CMS server - fixed for production
const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Create Express app
const app = express();

// Initialize Payload
const start = async () => {
  try {
    // Initialize Payload with the Express app
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      express: app,
      onInit: () => {
        console.log('Payload initialized successfully');
      },
    });

    // Redirect root to Admin panel
    app.get('/', (_, res) => {
      res.redirect('/admin');
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Admin URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${PORT}`}/admin`);
    });
  } catch (error) {
    console.error('Error starting Payload:', error);
    console.error(error.stack);
  }
};

start().catch(error => {
  console.error('Failed to start server:', error);
});
