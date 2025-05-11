/**
 * Payload CMS Server Configuration
 * Properly structured for Render deployment
 */

const express = require('express');
const payload = require('payload');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();

// Health check endpoint (before Payload initialization)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const start = async () => {
  try {
    // Set SERVER_URL environment variable if not set
    if (!process.env.SERVER_URL) {
      process.env.SERVER_URL = 'https://selfcast-cms-admin.onrender.com';
      console.log(`Setting SERVER_URL to ${process.env.SERVER_URL}`);
    }

    // Initialize Payload BEFORE defining any custom routes
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.MONGODB_URI,
      express: app,
      onInit: async () => {
        payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
        payload.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        payload.logger.info(`Server URL: ${process.env.SERVER_URL}`);
      },
    });

    // Add a simple test API endpoint AFTER Payload initialization
    app.get('/api/test', (req, res) => {
      res.json({
        status: 'success',
        message: 'API is working correctly',
        timestamp: new Date().toISOString()
      });
    });

    // Create a diagnostic page for troubleshooting
    app.get('/diagnostics', (req, res) => {
      // Get information about the server environment
      const diagnosticInfo = {
        nodeEnv: process.env.NODE_ENV || 'not set',
        port: process.env.PORT || '3000',
        payloadSecret: process.env.PAYLOAD_SECRET ? 'set' : 'not set',
        mongodbUri: process.env.MONGODB_URI ? 'set' : 'not set',
        serverUrl: process.env.SERVER_URL || 'not set',
        payloadAdminUrl: payload.getAdminURL(),
        dirname: __dirname,
        cwd: process.cwd(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
      
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payload CMS Diagnostics</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
              .links { margin: 20px 0; }
              .links a { display: inline-block; margin-right: 15px; }
              .section { margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <h1>Payload CMS Diagnostics</h1>
            
            <div class="section">
              <h2>Environment Information</h2>
              <pre>${JSON.stringify(diagnosticInfo, null, 2)}</pre>
            </div>
            
            <div class="section">
              <h2>Test Links</h2>
              <div class="links">
                <a href="/">Home</a>
                <a href="/admin">Admin Panel</a>
                <a href="/admin/">Admin Panel (with trailing slash)</a>
                <a href="/api/globals">API Globals</a>
                <a href="/api/test">API Test</a>
                <a href="/health">Health Check</a>
              </div>
            </div>
            
            <div class="section">
              <h2>Admin Panel Status</h2>
              <p>The admin panel should be accessible at: <code>${payload.getAdminURL()}</code></p>
            </div>
          </body>
        </html>
      `);
    });

    // Redirect root to admin panel
    app.get('/', (_, res) => {
      res.redirect('/admin');
    });

    // Bind to the port specified by Render (IMPORTANT: bind to 0.0.0.0)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      payload.logger.info(`Server started on port ${PORT}`);
      payload.logger.info(`Server bound to 0.0.0.0 (all interfaces) as required by Render`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
start();
