// Simple FastStart CMS for Self Cast Studios
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create Express app
const app = express();
app.use(express.json());

// Health check endpoint
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

// API endpoints for each collection
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
});

// Admin dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Self Cast Studios Admin</title>
      <style>
        body { font-family: Arial; margin: 0; padding: 20px; background: #f5f5f7; }
        .header { background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; color: white; margin-bottom: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Self Cast Studios Admin</h1>
        <p>Content Management System</p>
      </div>
      
      <div class="card">
        <h2>Database Connection</h2>
        <p id="db-status">Checking connection...</p>
      </div>
      
      <div class="card">
        <h2>Available API Endpoints</h2>
        <ul>
          <li><a href="/api/sites">/api/sites</a> - Site Configuration</li>
          <li><a href="/api/blogposts">/api/blogposts</a> - Blog Posts</li>
          <li><a href="/api/socialposts">/api/socialposts</a> - Social Media Posts</li>
          <li><a href="/api/biocards">/api/biocards</a> - Bio Cards</li>
          <li><a href="/api/quotes">/api/quotes</a> - Quotes</li>
          <li><a href="/api/media">/api/media</a> - Media</li>
        </ul>
      </div>
      
      <div class="card">
        <h2>Client Website</h2>
        <p>View the Self Cast Studios client website:</p>
        <a href="http://localhost:7777" class="button">Open Website</a>
      </div>
      
      <script>
        // Check database connection
        fetch('/api/health')
          .then(response => response.json())
          .then(data => {
            if (data.database) {
              document.getElementById('db-status').innerHTML = '✅ Connected to MongoDB';
            } else {
              document.getElementById('db-status').innerHTML = '❌ Failed to connect to MongoDB';
            }
          })
          .catch(error => {
            document.getElementById('db-status').innerHTML = '❌ Error checking connection';
          });
      </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
=========================================
✅ Self Cast Studios CMS is running!
=========================================
🌐 Admin:  http://localhost:${PORT}
🔌 API:    http://localhost:${PORT}/api
=========================================
`);
});
