/**
 * Production server for Payload CMS
 */

// Dependencies
require('dotenv').config();
const express = require('express');
const payload = require('payload');
const path = require('path');

// Create express app
const app = express();

// Add middleware to serve admin UI static files
app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets')));

// Redirect root to admin
app.get('/', (_, res) => {
  res.redirect('/admin');
});

// Initialize Payload
const start = async () => {
  try {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      express: app,
      onInit: () => {
        console.log(`Payload Admin URL: ${payload.getAdminURL()}`);
      },
    });

    // Add a route to serve the admin panel
    app.get('/admin', (_, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Payload CMS Admin</title>
            <link rel="stylesheet" href="/admin/bundle.css" />
          </head>
          <body>
            <div id="app"></div>
            <script src="/admin/bundle.js"></script>
          </body>
        </html>
      `);
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

start();
