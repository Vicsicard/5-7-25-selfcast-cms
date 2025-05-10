// Simplified Vercel-specific handler for Payload CMS
const express = require('express');
const payload = require('payload');
const { buildConfig } = require('payload/config');
const { mongooseAdapter } = require('@payloadcms/db-mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();

// Track initialization
let payloadInitialized = false;

// Create an inline config for serverless environment
const createConfig = () => {
  console.log('Creating inline Payload config for serverless environment');
  return buildConfig({
    serverURL: process.env.NEXT_PUBLIC_API_URL || 'https://5-7-25-selfcast-cms.vercel.app',
    admin: false, // Completely disable admin in serverless
    collections: [
      // Minimal users collection
      {
        slug: 'users',
        auth: true,
        fields: [
          {
            name: 'email',
            type: 'email',
            required: true,
          }
        ],
      },
      // Minimal media collection
      {
        slug: 'media',
        upload: {
          staticURL: '/media',
          staticDir: 'media',
          mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
        },
        fields: [],
      }
    ],
    db: mongooseAdapter({
      url: process.env.MONGODB_URI,
      connectOptions: {
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
        keepAlive: true,
        keepAliveInitialDelay: 300000,
      },
    }),
  });
};

// Vercel serverless handler
const handler = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received:`, req.method, req.url);
  
  try {
    // Initialize Payload only once
    if (!payloadInitialized) {
      console.log('Initializing Payload for Vercel serverless...');
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set');
      console.log('Payload Secret:', process.env.PAYLOAD_SECRET ? 'Set (hidden)' : 'Not set');
      
      try {
        // Create an inline config instead of loading from file
        const config = createConfig();
        
        // Initialize with inline config
        await payload.init({
          express: app,
          secret: process.env.PAYLOAD_SECRET || 'selfcast-studios-secret-key',
          mongoURL: process.env.MONGODB_URI,
          config: config,
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
        <p>MongoDB connection: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}</p>
      </body></html>`);
    });

    return app(req, res);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).send('Server error');
  }
};

module.exports = handler;
