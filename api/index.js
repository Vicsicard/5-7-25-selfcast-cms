// Vercel Serverless Function to handle all CMS routes
const express = require('express');
const payload = require('payload');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Enhanced logging to help diagnose issues
console.log('Starting serverless function');
console.log('Current working directory:', process.cwd());
console.log('Node environment:', process.env.NODE_ENV);
console.log('Payload version:', require('payload/package.json').version);

// Check if config file exists at expected locations
const rootConfigPath = path.resolve(process.cwd(), 'payload.config.js');
const configExists = fs.existsSync(rootConfigPath);
console.log(`Config file exists at ${rootConfigPath}:`, configExists);

// List files in current directory for debugging
try {
  const files = fs.readdirSync(process.cwd());
  console.log('Files in current directory:', files);
} catch (err) {
  console.error('Error listing directory:', err);
}

// Create Express app
const app = express();

// Initialize Payload only once
let payloadInitialized = false;

// Define a serverless handler function for all routes
const handler = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received:`, req.method, req.url);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));

  // Set up error handling for unhandled rejections and exceptions
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  try {
    // Initialize Payload if it hasn't been initialized yet
    if (!payloadInitialized) {
      console.log('Attempting to initialize Payload...');
      console.log('Environment variables available:', {
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? 'Set' : 'Not set',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'Set' : 'Not set'
      });

      try {
        // Attempt to initialize with minimal config to avoid TS config issues
        console.log('Initializing with inline config');
        await payload.init({
          secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-testing',
          mongoURL: process.env.MONGODB_URI,
          express: app,
          email: {
            fromName: 'Self Cast Studios',
            fromAddress: 'noreply@selfcaststudios.com',
          },
          // Minimal collections setup
          collections: [
            {
              slug: 'users',
              auth: true,
              admin: { useAsTitle: 'email' },
              fields: [{ name: 'email', type: 'email', required: true }]
            },
            {
              slug: 'media',
              upload: { staticDir: 'media' },
              fields: []
            }
          ],
          onInit: () => {
            console.log('Payload initialized successfully!');
          },
        });
        
        payloadInitialized = true;
        console.log('Payload initialization successful!');
      } catch (error) {
        console.error('Detailed initialization error:', error);
        if (error.stack) console.error('Error stack:', error.stack);
        return res.status(500).send(`<html><body>
          <h1>Error during CMS initialization</h1>
          <pre>${error.message}</pre>
          <p>Check server logs for more details.</p>
          <h2>Debug Info:</h2>
          <pre>Node version: ${process.version}</pre>
          <pre>Working directory: ${process.cwd()}</pre>
          <pre>Files in directory: ${JSON.stringify(fs.readdirSync(process.cwd()), null, 2)}</pre>
        </body></html>`);
      }
    }

    // Add a root redirect to admin
    app.get('/', (_, res) => {
      console.log('Root route requested, redirecting to /admin');
      res.redirect('/admin');
    });

    // Debug route
    app.get('/debug', (_, res) => {
      res.send({
        env: process.env.NODE_ENV,
        cwd: process.cwd(),
        nodeVersion: process.version,
        files: fs.readdirSync(process.cwd()),
        payloadInitialized
      });
    });

    console.log('Passing control to Express app');
    return app(req, res);
  } catch (error) {
    console.error('Unexpected error in handler:', error);
    return res.status(500).send(`<html><body>
      <h1>Unexpected Server Error</h1>
      <pre>${error.message}</pre>
    </body></html>`);
  }
};

module.exports = handler;
