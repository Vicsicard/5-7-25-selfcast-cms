// Vercel Serverless Function to handle all CMS routes
const express = require('express');
const payload = require('payload');
require('dotenv').config();

// Don't try to use TypeScript files directly in a Node.js environment
// Instead, we'll define our configuration inline

// Create Express app
const app = express();

// Initialize Payload only once
let payloadInitialized = false;

// Define a serverless handler function for all routes
const handler = async (req, res) => {
  // Initialize Payload if it hasn't been initialized yet
  if (!payloadInitialized) {
    try {
      // Copy your simple config and modify only what's needed
      // This avoids config file path issues in Vercel
      await payload.init({
        secret: process.env.PAYLOAD_SECRET,
        mongoURL: process.env.MONGODB_URI,
        express: app,
        email: {
          fromName: 'Self Cast Studios',
          fromAddress: 'noreply@selfcaststudios.com',
        },
        cors: process.env.NODE_ENV === 'production' 
          ? [process.env.NEXT_PUBLIC_API_URL, 'https://5-7-25-selfcast-cms.vercel.app'] 
          : ['http://localhost:3000'],
        admin: {
          user: 'users',
          meta: {
            titleSuffix: '- Self Cast Studios CMS',
            favicon: '/favicon.ico',
          },
        },
        collections: [
          // Basic Media collection
          {
            slug: 'media',
            upload: {
              staticDir: 'media',
            },
            fields: [],
          },
          // Basic Users collection
          {
            slug: 'users',
            auth: true,
            admin: {
              useAsTitle: 'email',
            },
            fields: [
              {
                name: 'email',
                type: 'email',
                required: true,
              },
            ],
          }
        ],
        // Optimize for serverless environment
        rateLimit: {
          window: 5 * 60 * 1000, // 5 minutes
          max: 100, // limit each IP to 100 requests per window
        },
        maxDepth: 10, // Prevent excessive query depth
        onInit: async () => {
          console.log(`Payload initialized successfully`);
          console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        },
      });
      
      payloadInitialized = true;
      console.log('Payload initialized successfully');
    } catch (error) {
      console.error('Error initializing Payload:', error);
      return res.status(500).send(`Internal Server Error during initialization: ${error.message}`);
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
