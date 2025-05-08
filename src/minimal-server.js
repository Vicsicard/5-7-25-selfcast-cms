const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create Express app
const app = express();

// Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

// Basic landing page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Self Cast Studios CMS</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #f5f5f7; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
          header { background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 2rem; color: white; }
          h1 { margin: 0; font-size: 2.5rem; }
          .card { background: white; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Self Cast Studios CMS</h1>
            <p>Content Management System for Self Cast Studios</p>
          </div>
        </header>
        <div class="container">
          <div class="card">
            <h2>API Endpoints Available</h2>
            <p>The following API endpoints are available for the client website:</p>
            <ul>
              <li>/api/sites - Retrieve site configuration</li>
              <li>/api/blogposts - Access blog content</li>
              <li>/api/socialposts - Get social media posts</li>
              <li>/api/biocards - Retrieve team member information</li>
              <li>/api/quotes - Get testimonial quotes</li>
              <li>/api/media - Access uploaded media</li>
            </ul>
          </div>
          <div class="card">
            <h2>Connected Database</h2>
            <p>MongoDB Connection: <code id="dbStatus">Checking...</code></p>
          </div>
          <div class="card">
            <h2>Client Website</h2>
            <p>The Self Cast Studios client website is running at:</p>
            <p><a href="http://localhost:7777" class="button">Visit Website</a></p>
          </div>
        </div>
        <script>
          // Check database connection
          fetch('/api/health')
            .then(response => response.json())
            .then(data => {
              document.getElementById('dbStatus').textContent = data.database ? 'Connected' : 'Disconnected';
            })
            .catch(() => {
              document.getElementById('dbStatus').textContent = 'Error checking connection';
            });
        </script>
      </body>
    </html>
  `);
});

// Simple API to check health
app.get('/api/health', async (req, res) => {
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    res.json({ status: 'ok', database: true });
  } catch (err) {
    console.error('Database connection error:', err);
    res.json({ status: 'error', database: false, message: err.message });
  } finally {
    if (client) await client.close();
  }
});

// Basic API routes
const collections = ['sites', 'blogposts', 'socialposts', 'biocards', 'quotes', 'media'];

collections.forEach(collection => {
  app.get(`/api/${collection}`, async (req, res) => {
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      const data = await db.collection(collection).find({}).toArray();
      res.json(data);
    } catch (err) {
      console.error(`Error fetching ${collection}:`, err);
      res.status(500).json({ error: err.message });
    } finally {
      if (client) await client.close();
    }
  });

  app.get(`/api/${collection}/:id`, async (req, res) => {
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      const data = await db.collection(collection).findOne({ _id: req.params.id });
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    } catch (err) {
      console.error(`Error fetching ${collection} by ID:`, err);
      res.status(500).json({ error: err.message });
    } finally {
      if (client) await client.close();
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
