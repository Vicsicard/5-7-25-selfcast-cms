const express = require('express');
const payload = require('payload');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
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
    dirname: __dirname,
    cwd: process.cwd(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
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
          <h2>Admin Panel Troubleshooting</h2>
          <p>If you're having trouble accessing the admin panel, try these steps:</p>
          <ol>
            <li>Check that MongoDB is properly connected</li>
            <li>Verify that the Payload CMS build completed successfully</li>
            <li>Try accessing the admin panel with and without a trailing slash</li>
            <li>Clear your browser cache or try a different browser</li>
          </ol>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
      payload.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
  
  // Redirect root to diagnostics page
  app.get('/', (_, res) => {
    res.redirect('/diagnostics');
  });
  
  // Serve static files from the public directory
  app.use(express.static(path.resolve(__dirname, 'public')));
  
  // Always start the server for both development and production
  // Use the PORT environment variable provided by Render
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    payload.logger.info(`Server started on port ${PORT}`);
  });
};

start();
