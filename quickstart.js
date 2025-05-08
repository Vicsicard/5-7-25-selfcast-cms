const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create Express app
const app = express();

// Support JSON request bodies
app.use(express.json());

// Setup CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Simple admin UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Self Cast Studios Admin</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen">
          <header class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div class="max-w-7xl mx-auto">
              <h1 class="text-3xl font-bold">Self Cast Studios Admin</h1>
              <p class="mt-2 text-lg">Content Management System</p>
            </div>
          </header>
          
          <main class="max-w-7xl mx-auto py-8 px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">MongoDB Status</h2>
                <div id="db-status" class="flex items-center">
                  <div class="animate-pulse mr-3 h-4 w-4 rounded-full bg-gray-300"></div>
                  <span>Checking connection...</span>
                </div>
              </div>
              
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">API Status</h2>
                <div class="space-y-2">
                  <p>Endpoint: <code class="bg-gray-100 p-1 rounded">http://localhost:3000/api</code></p>
                  <a href="/api" target="_blank" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Open API Explorer</a>
                </div>
              </div>
            </div>
            
            <h2 class="text-2xl font-bold mb-4">Collections</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold">Sites</h3>
                <p class="text-gray-600 mb-4">Website configuration and settings</p>
                <div id="sites-count" class="text-sm">Loading...</div>
                <div class="mt-4 flex space-x-2">
                  <a href="/api/sites" class="text-blue-500 hover:underline">View API</a>
                </div>
              </div>
              
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold">Blog Posts</h3>
                <p class="text-gray-600 mb-4">Articles and blog entries</p>
                <div id="blogposts-count" class="text-sm">Loading...</div>
                <div class="mt-4 flex space-x-2">
                  <a href="/api/blogposts" class="text-blue-500 hover:underline">View API</a>
                </div>
              </div>
              
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold">Social Posts</h3>
                <p class="text-gray-600 mb-4">Content for social media platforms</p>
                <div id="socialposts-count" class="text-sm">Loading...</div>
                <div class="mt-4 flex space-x-2">
                  <a href="/api/socialposts" class="text-blue-500 hover:underline">View API</a>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">Client Website</h2>
                <p class="mb-4">The Self Cast Studios client-facing website is available at:</p>
                <a href="http://localhost:7777" target="_blank" class="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Visit Website</a>
              </div>
              
              <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-xl font-semibold mb-4">API Documentation</h2>
                <p class="mb-4">Available endpoints:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li><code class="bg-gray-100 p-1 rounded">/api/sites</code> - Site configuration</li>
                  <li><code class="bg-gray-100 p-1 rounded">/api/blogposts</code> - Blog articles</li>
                  <li><code class="bg-gray-100 p-1 rounded">/api/socialposts</code> - Social media content</li>
                  <li><code class="bg-gray-100 p-1 rounded">/api/biocards</code> - Team information</li>
                  <li><code class="bg-gray-100 p-1 rounded">/api/quotes</code> - Testimonials</li>
                  <li><code class="bg-gray-100 p-1 rounded">/api/media</code> - Uploaded assets</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
        
        <script>
          // Check MongoDB connection
          fetch('/api/health')
            .then(response => response.json())
            .then(data => {
              const dbStatus = document.getElementById('db-status');
              if (data.database) {
                dbStatus.innerHTML = '<div class="mr-3 h-4 w-4 rounded-full bg-green-500"></div><span>Connected to MongoDB</span>';
              } else {
                dbStatus.innerHTML = '<div class="mr-3 h-4 w-4 rounded-full bg-red-500"></div><span>Disconnected</span>';
              }
            })
            .catch(error => {
              document.getElementById('db-status').innerHTML = '<div class="mr-3 h-4 w-4 rounded-full bg-red-500"></div><span>Error checking connection</span>';
            });
            
          // Load collection counts
          ['sites', 'blogposts', 'socialposts'].forEach(collection => {
            fetch(`/api/${collection}`)
              .then(response => response.json())
              .then(data => {
                document.getElementById(`${collection}-count`).textContent = `${data.length} items found`;
              })
              .catch(error => {
                document.getElementById(`${collection}-count`).textContent = 'Error loading data';
              });
          });
        </script>
      </body>
    </html>
  `);
});

// API Explorer page
app.get('/api', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Self Cast Studios API Explorer</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100">
        <div class="min-h-screen">
          <header class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div class="max-w-7xl mx-auto">
              <h1 class="text-3xl font-bold">API Explorer</h1>
              <p class="mt-2 text-lg">Self Cast Studios CMS</p>
            </div>
          </header>
          
          <main class="max-w-7xl mx-auto py-8 px-4">
            <div class="bg-white p-6 rounded-lg shadow mb-6">
              <div class="flex items-center mb-4">
                <h2 class="text-xl font-semibold">Endpoint</h2>
                <select id="endpoint" class="ml-4 border rounded px-2 py-1">
                  <option value="sites">Sites</option>
                  <option value="blogposts">Blog Posts</option>
                  <option value="socialposts">Social Posts</option>
                  <option value="biocards">Bio Cards</option>
                  <option value="quotes">Quotes</option>
                  <option value="media">Media</option>
                </select>
                <button id="fetch-btn" class="ml-4 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">Fetch Data</button>
              </div>
              
              <div class="bg-gray-100 p-4 rounded">
                <pre class="text-sm"><code id="endpoint-url">http://localhost:3000/api/sites</code></pre>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
              <h2 class="text-xl font-semibold mb-4">Response</h2>
              <pre id="response" class="bg-gray-100 p-4 rounded overflow-auto max-h-96">Click "Fetch Data" to see results...</pre>
            </div>
          </main>
        </div>
        
        <script>
          const endpointSelect = document.getElementById('endpoint');
          const endpointUrl = document.getElementById('endpoint-url');
          const fetchBtn = document.getElementById('fetch-btn');
          const responseArea = document.getElementById('response');
          
          // Update endpoint URL on select change
          endpointSelect.addEventListener('change', () => {
            endpointUrl.textContent = \`http://localhost:3000/api/\${endpointSelect.value}\`;
          });
          
          // Fetch data on button click
          fetchBtn.addEventListener('click', () => {
            responseArea.textContent = 'Loading...';
            
            fetch(\`/api/\${endpointSelect.value}\`)
              .then(response => response.json())
              .then(data => {
                responseArea.textContent = JSON.stringify(data, null, 2);
              })
              .catch(error => {
                responseArea.textContent = \`Error: \${error.message}\`;
              });
          });
        </script>
      </body>
    </html>
  `);
});

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

// Basic API for collections
const collections = ['sites', 'blogposts', 'socialposts', 'biocards', 'quotes', 'media'];

collections.forEach(collection => {
  // Get all items
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

  // Get item by ID
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

// Create a simple batch file
const fs = require('fs');
fs.writeFileSync('start.bat', '@echo off\necho Starting Self Cast Studios CMS...\nnode quickstart.js');

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n======================================');
  console.log('✅ Self Cast Studios CMS is running!');
  console.log('======================================');
  console.log(`🌐 Admin dashboard: http://localhost:${PORT}`);
  console.log(`🔌 API endpoint: http://localhost:${PORT}/api`);
  console.log(`📊 API explorer: http://localhost:${PORT}/api`);
  console.log('======================================');
  console.log('To quickly start the CMS in the future, just run:');
  console.log('start.bat');
  console.log('======================================\n');
});
