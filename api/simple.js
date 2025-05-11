// Ultra-simplified API handler for Render
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create Express app
const app = express();

// MongoDB connection status
let mongoConnected = false;
let mongoError = null;

// Set up MongoDB connection
const mongoUri = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoUri ? 'Set (hidden)' : 'Not set');

// Add API endpoints
app.get('/api/status', async (req, res) => {
  try {
    // Test MongoDB connection
    if (!mongoConnected && mongoUri) {
      const client = new MongoClient(mongoUri);
      await client.connect();
      await client.db().admin().ping();
      mongoConnected = true;
      await client.close();
    }
    
    res.json({ 
      status: 'online', 
      mongodb: mongoConnected ? 'connected' : 'not connected',
      error: mongoError
    });
  } catch (error) {
    mongoError = error.message;
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Fallback for non-API routes
app.get('/', (req, res) => {
  res.send(`<html>
    <head>
      <title>Selfcast CMS API</title>
      <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
        h1 { color: #333; }
        .success { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>Selfcast CMS API</h1>
      <div class="card">
        <h2>Status</h2>
        <p>This is the API endpoint for the Selfcast CMS.</p>
        <p>The admin UI is not available in the serverless environment.</p>
        <p>Current time: ${new Date().toISOString()}</p>
        <p>MongoDB connection: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}</p>
      </div>
      <div class="card">
        <h2>API Endpoints</h2>
        <ul>
          <li><a href="/api/status">/api/status</a> - Check API and database status</li>
        </ul>
      </div>
      <div class="card">
        <h2>Environment</h2>
        <p>Node.js: ${process.version}</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
      </div>
    </body>
  </html>`);
});

// Set up the port
const PORT = process.env.PORT || 10000;

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for potential serverless use
module.exports = app;
