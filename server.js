// Production server entry point for Payload CMS
const express = require('express');
const payload = require('payload');
const path = require('path');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the admin build directory
// This is critical for the admin UI to load properly
app.use(express.static(path.resolve(__dirname, 'dist')));

// Initialize Payload
const start = async () => {
  try {
    // Initialize Payload with explicit config path
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'selfcast-studios-7af51d0c-ac48-4845-a41a',
      express: app,
      configPath: process.env.PAYLOAD_CONFIG_PATH || path.resolve(__dirname, 'dist/payload.config.js'),
      onInit: async () => {
        console.log(`Payload Admin URL: ${payload.getAdminURL()}`);
        console.log('Payload CMS initialized successfully');
      },
    });

    // Log available collections for debugging
    if (payload.collections) {
      const collectionSlugs = payload.collections.map(c => c.config.slug).join(', ');
      console.log(`Available collections: ${collectionSlugs}`);
    }

    // Redirect root to Admin panel
    app.get('/', (_, res) => {
      res.redirect('/admin');
    });

    // Health check endpoint
    app.get('/api/health', (_, res) => {
      res.status(200).json({ 
        status: 'ok', 
        environment: process.env.NODE_ENV,
        payload: payload ? 'initialized' : 'not initialized',
        admin: payload.getAdminURL ? payload.getAdminURL() : 'unknown',
        collections: payload.collections ? payload.collections.map(c => c.config.slug) : []
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error', message: err.message });
    });

    // Add a catch-all route for the admin SPA
    // This must be after all other routes
    app.get('*', (req, res) => {
      // Only serve the admin SPA for /admin routes
      if (req.url.startsWith('/admin')) {
        res.sendFile(path.resolve(__dirname, 'dist', 'admin', 'index.html'));
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
      console.log(`Server URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || `http://localhost:${PORT}`}`);
      console.log(`Admin panel available at /admin`);
    });
  } catch (error) {
    console.error('Failed to start Payload:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error('Error starting server:', err);
  console.error(err.stack);
  process.exit(1);
});
