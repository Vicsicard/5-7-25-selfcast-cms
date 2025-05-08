// CMS Server with Homepage Editor
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Import editor routes
const homeEditorRoutes = require('./home-editor-route');
const aboutEditorRoutes = require('./about-editor-route');
const blogEditorRoutes = require('./blog-editor-route');
const projectsEditorRoutes = require('./projects-editor-route');
const socialEditorRoutes = require('./social-editor-route');
const contactEditorRoutes = require('./contact-editor-route');
const globalEditorRoutes = require('./global-editor-route');

// Create Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// JWT Secret
const JWT_SECRET = process.env.PAYLOAD_SECRET || 'selfcast-studios-secret-key';

// Admin credentials
const ADMIN_EMAIL = 'vicsicard@gmail.com';
const ADMIN_PASSWORD = 'Jerrygarcia1993!';

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                  ? req.headers.authorization.split(' ')[1] : null);
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Set user in request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    req.user = null;
    next();
  }
};

// Apply auth middleware to all routes
app.use(authMiddleware);

// Use editor routes
app.use(homeEditorRoutes);
app.use(aboutEditorRoutes);
app.use(blogEditorRoutes);
app.use(projectsEditorRoutes);
app.use(socialEditorRoutes);
app.use(contactEditorRoutes);
app.use(globalEditorRoutes);

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Check if admin login
  if (email === ADMIN_EMAIL) {
    if (password === ADMIN_PASSWORD) {
      // Create token for admin
      const token = jwt.sign(
        { id: 'admin', email, role: 'admin', name: 'Admin User' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
      
      return res.json({
        user: { id: 'admin', email, role: 'admin', name: 'Admin User' },
        token
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }
  
  // Regular user login
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check password (if stored as hash)
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else if (user.plainPassword && user.plainPassword !== password) {
      // Fallback for plain passwords (not recommended for production)
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email, 
        role: user.role || 'user',
        name: user.name || ''
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    // Return user info (without password)
    const { password: pwd, plainPassword, ...userWithoutPassword } = user;
    
    res.json({
      user: { ...userWithoutPassword, id: user._id.toString() },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (client) await client.close();
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get users for admin
app.get('/api/users', async (req, res) => {
  // Check if admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Get users without passwords
    const users = await db.collection('users')
      .find({})
      .project({ password: 0, plainPassword: 0 })
      .toArray();
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
});

// Admin dashboard with client selector
app.get('/', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  const isAdmin = req.user.role === 'admin';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Self Cast Studios Admin</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f7; }
        .header { background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; color: white; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; }
        .user-info { display: flex; align-items: center; }
        .user-badge { background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; margin-right: 10px; }
        .logout-btn { background: rgba(0,0,0,0.1); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none; }
        
        /* Client Selector Styles */
        .client-selector { background-color: #f0f4f8; border-bottom: 1px solid #ddd; padding: 10px 0; display: ${isAdmin ? 'block' : 'none'}; }
        .selector-wrapper { display: flex; align-items: center; gap: 15px; }
        .selector-wrapper label { font-weight: bold; color: #333; margin-right: 5px; }
        #client-select { flex-grow: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; max-width: 400px; }
        .view-btn { background: #3b82f6; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .view-btn:hover { background: #2563eb; }
        .admin-only { display: ${isAdmin ? 'block' : 'none'}; }
        
        /* Editor Navigation Styles */
        .editor-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        .editor-nav .button {
          flex: 1 1 calc(33.333% - 10px);
          min-width: 120px;
          text-align: center;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }
        .editor-nav .button:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }
        .editor-nav .button.disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          color: #64748b;
        }
        .editor-nav .button.disabled:hover {
          transform: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Self Cast Studios Admin</h1>
        <div class="user-info">
          <div class="user-badge">${isAdmin ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <!-- Admin-only client selector -->
      <div class="client-selector">
        <div class="container">
          <div class="selector-wrapper">
            <label for="client-select">Select Client:</label>
            <select id="client-select">
              <option value="">-- All Clients --</option>
              <!-- Client options will be populated dynamically -->
            </select>
            <button id="view-client-btn" class="view-btn">View Selected Client</button>
          </div>
        </div>
      </div>
      
      <div class="container">
        <div class="card">
          <h2>Database Connection</h2>
          <p id="db-status">Checking connection...</p>
        </div>
        
        <div id="client-display" style="display: none;"></div>
        
        <div class="card">
          <h2>Website Editor</h2>
          <p>Edit your website content:</p>
          <div class="editor-nav">
            <a href="/editor/home" class="button">Home Page</a>
            <a href="/editor/about" class="button">About Page</a>
            <a href="/editor/blog" class="button">Blog</a>
            <a href="/editor/projects" class="button">Projects</a>
            <a href="/editor/social" class="button">Social</a>
            <a href="/editor/contact" class="button">Contact</a>
            <a href="/editor/global" class="button">Global Components</a>
          </div>
        </div>
        
        <div class="card admin-only">
          <h2>User Management</h2>
          <p>Manage user accounts:</p>
          <a href="/api/users" class="button">View All Users</a>
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
          <a href="http://localhost:7777" class="button" target="_blank">Open Website</a>
        </div>
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
          
        // Logout functionality
        document.getElementById('logout-btn').addEventListener('click', async () => {
          try {
            await fetch('/api/logout', { method: 'POST' });
            localStorage.removeItem('token');
            window.location.href = '/login';
          } catch (error) {
            console.error('Logout failed:', error);
          }
        });
        
        // Admin-only: Fetch and populate client list
        const populateClientList = async () => {
          // Only run for admin users
          if (!document.querySelector('.client-selector') || 
              document.querySelector('.client-selector').style.display === 'none') {
            return;
          }
          
          try {
            const response = await fetch('/api/users');
            
            if (!response.ok) {
              throw new Error('Failed to fetch users');
            }
            
            const users = await response.json();
            const clientSelect = document.getElementById('client-select');
            
            // Sort users alphabetically by name or email
            const sortedUsers = users
              .filter(user => user.role !== 'admin') // Exclude admin users
              .sort((a, b) => {
                // Sort by name if available, otherwise by email
                const nameA = a.name || a.email || '';
                const nameB = b.name || b.email || '';
                return nameA.localeCompare(nameB);
              });
            
            // Add options to select
            sortedUsers.forEach(user => {
              const option = document.createElement('option');
              option.value = user._id || user.id;
              option.textContent = user.name ? user.name + ' (' + user.email + ')' : user.email;
              clientSelect.appendChild(option);
            });
            
            // Handle view client button
            document.getElementById('view-client-btn').addEventListener('click', () => {
              const selectedClientId = clientSelect.value;
              if (selectedClientId) {
                // Redirect to client-specific view or filter current view
                localStorage.setItem('selectedClientId', selectedClientId);
                
                // Find the client name from the select
                const selectedOption = Array.from(clientSelect.options).find(option => option.value === selectedClientId);
                const clientName = selectedOption ? selectedOption.textContent : selectedClientId;
                
                // Update client display
                const clientDisplay = document.getElementById('client-display');
                clientDisplay.style.display = 'block';
                clientDisplay.style.padding = '10px';
                clientDisplay.style.margin = '10px 0';
                clientDisplay.style.backgroundColor = '#e6f7ff';
                clientDisplay.style.borderRadius = '4px';
                clientDisplay.innerHTML = '<strong>Currently viewing:</strong> ' + clientName;
                
                alert('Now viewing client: ' + clientName);
              } else {
                // Reset to view all clients
                localStorage.removeItem('selectedClientId');
                document.getElementById('client-display').style.display = 'none';
                alert('Now viewing all clients');
              }
            });
            
            // Check if we have a previously selected client
            const savedClientId = localStorage.getItem('selectedClientId');
            if (savedClientId) {
              clientSelect.value = savedClientId;
              
              // Trigger the view client button click to update the UI
              document.getElementById('view-client-btn').click();
            }
            
          } catch (error) {
            console.error('Error fetching client list:', error);
          }
        };
        
        // Initialize client list for admin
        populateClientList();
      </script>
    </body>
    </html>
  `);
});

// Login page HTML
app.get('/login', (req, res) => {
  // If already logged in, redirect to admin
  if (req.user) {
    return res.redirect('/');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Self Cast Studios CMS - Login</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f7;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .login-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
          width: 350px;
        }
        .header {
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          margin: -30px -30px 20px;
          padding: 20px 30px;
          border-radius: 8px 8px 0 0;
          color: white;
        }
        h1 {
          margin: 0;
          font-size: 24px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        button {
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          padding: 12px;
          width: 100%;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }
        button:hover {
          opacity: 0.9;
        }
        .error {
          color: #e53e3e;
          margin-top: 15px;
          text-align: center;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="header">
          <h1>Self Cast Studios CMS</h1>
          <p>Content Management System</p>
        </div>
        
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit">Login</button>
          
          <div id="error-message" class="error"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const errorElement = document.getElementById('error-message');
          
          try {
            errorElement.style.display = 'none';
            
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || 'Login failed');
            }
            
            // Successful login
            localStorage.setItem('token', data.token);
            window.location.href = '/';
          } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
          }
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
    res.json({ 
      status: 'ok', 
      database: true,
      authenticated: !!req.user,
      user: req.user ? { 
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      } : null
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.json({ status: 'error', database: false, message: err.message });
  } finally {
    if (client) await client.close();
  }
});

// API endpoints for each collection with auth protection
const collections = ['sites', 'blogposts', 'socialposts', 'biocards', 'quotes', 'media'];

collections.forEach(collection => {
  // Get all items (admin sees all, users see only their own)
  app.get(`/api/${collection}`, async (req, res) => {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      let query = {};
      
      // If not admin, filter by user ID
      if (req.user.role !== 'admin') {
        query = { userId: req.user.id };
      }
      
      // If admin has selected a specific client
      const clientId = req.query.clientId;
      if (req.user.role === 'admin' && clientId) {
        query = { userId: clientId };
      }
      
      const data = await db.collection(collection).find(query).toArray();
      res.json(data);
    } catch (err) {
      console.error(`Error fetching ${collection}:`, err);
      res.status(500).json({ error: err.message });
    } finally {
      if (client) await client.close();
    }
  });
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`
=========================================
✅ Self Cast Studios CMS is running!
=========================================
🌐 Admin:  http://localhost:${PORT}
🔌 API:    http://localhost:${PORT}/api
🔑 Login:  http://localhost:${PORT}/login
=========================================
Admin credentials:
Email: ${ADMIN_EMAIL}
Password: ${ADMIN_PASSWORD}
=========================================
  `);
});
