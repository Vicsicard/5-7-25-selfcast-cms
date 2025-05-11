const express = require('express');
const payload = require('payload');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Start the server
const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
    email: {
      fromName: 'Self Cast Studios',
      fromAddress: 'noreply@selfcaststudios.com',
    },
    // Optimize for serverless environment
    rateLimit: {
      window: 5 * 60 * 1000, // 5 minutes
      max: 100, // limit each IP to 100 requests per window
    },
    maxDepth: 10, // Prevent excessive query depth
    graphQL: {
      maxComplexity: 1000, // Limit GraphQL query complexity
      disablePlaygroundInProduction: true,
    },
    // Log initialization
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
      payload.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      payload.logger.info(`Payload CMS initialized with custom user access control`);
    },
  });
  
  // Add a simple test route
  app.get('/api/test', (req, res) => {
    res.json({
      status: 'success',
      message: 'API is working correctly',
      timestamp: new Date().toISOString()
    });
  });
  
  // Redirect root to Admin panel
  app.get('/', (_, res) => {
    res.redirect('/admin');
  });
  
  // Always start the server for both development and production
  // Use the PORT environment variable provided by Render
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    payload.logger.info(`Server started on port ${PORT}`);
  });
};

start();
