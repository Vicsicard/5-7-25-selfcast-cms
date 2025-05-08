const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Create Express app
const app = express();

// Allow payload to handle CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin');
});

// Start the server
const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'selfcast-studios-secret-key',
    mongoURL: process.env.MONGODB_URI,
    express: app,
    email: {
      fromName: 'Self Cast Studios',
      fromAddress: 'noreply@selfcaststudios.com',
    },
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
    },
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    payload.logger.info(`Server started on http://localhost:${PORT}`);
  });
};

start();
