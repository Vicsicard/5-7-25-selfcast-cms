// Vercel Serverless Function to handle all CMS routes
const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Create Express app
const app = express();

// Initialize Payload only once
let payloadInitialized = false;

// Define a serverless handler function for all routes
const handler = async (req, res) => {
  // Initialize Payload if it hasn't been initialized yet
  if (!payloadInitialized) {
    try {
      await payload.init({
        secret: process.env.PAYLOAD_SECRET,
        mongoURL: process.env.MONGODB_URI,
        express: app,
        email: {
          fromName: 'Self Cast Studios',
          fromAddress: 'noreply@selfcaststudios.com',
        },
        rateLimit: {
          window: 5 * 60 * 1000, // 5 minutes
          max: 100, // limit each IP to 100 requests per window
        },
        maxDepth: 10,
        graphQL: {
          maxComplexity: 1000,
          disablePlaygroundInProduction: true,
        },
        onInit: async () => {
          console.log(`Payload initialized: ${payload.getAdminURL()}`);
          console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        },
      });
      
      payloadInitialized = true;
      console.log('Payload initialized successfully');
    } catch (error) {
      console.error('Error initializing Payload:', error);
      return res.status(500).send('Internal Server Error during initialization');
    }
  }

  // Add a root redirect to admin
  app.get('/', (_, res) => {
    res.redirect('/admin');
  });

  // Pass control to the Express app
  return app(req, res);
};

module.exports = handler;
