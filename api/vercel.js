// Simplified Vercel-specific handler for Payload CMS
const express = require('express');
const payload = require('payload');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();

// Track initialization
let payloadInitialized = false;

// Vercel serverless handler
const handler = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received:`, req.method, req.url);
  
  try {
    // Initialize Payload only once
    if (!payloadInitialized) {
      console.log('Initializing Payload for Vercel serverless...');
      
      try {
        // IMPORTANT: Completely disable admin for serverless environment
        await payload.init({
          express: app,
          secret: process.env.PAYLOAD_SECRET || 'selfcast-studios-secret-key',
          mongoURL: process.env.MONGODB_URI,
          // Critical fix - forcing admin disabled in production
          admin: false,
          onInit: () => {
            console.log('Payload initialized successfully!');
          },
        });
        
        payloadInitialized = true;
        console.log('Payload initialization successful!');
      } catch (error) {
        console.error('Initialization error:', error);
        return res.status(500).send(`<html><body>
          <h1>Error during CMS initialization</h1>
          <pre>${error.message}</pre>
          <p>Check server logs for more details.</p>
          <p>This app is running in a serverless environment.</p>
        </body></html>`);
      }
    }

    // Add API endpoints
    app.get('/api/status', (_, res) => {
      res.json({ status: 'online', initialized: payloadInitialized });
    });

    // Fallback for non-API routes
    app.get('/', (_, res) => {
      res.send(`<html><body>
        <h1>Selfcast CMS API</h1>
        <p>This is the API endpoint for the Selfcast CMS.</p>
        <p>The admin UI is not available in the serverless environment.</p>
        <p>Current time: ${new Date().toISOString()}</p>
      </body></html>`);
    });

    return app(req, res);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).send('Server error');
  }
};

module.exports = handler;
