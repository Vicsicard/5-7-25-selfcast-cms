// Self Cast Studios CMS with Authentication
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// JWT Secret
const JWT_SECRET = process.env.PAYLOAD_SECRET || 'selfcast-studios-secret-key';

// Admin credentials
const ADMIN_EMAIL = 'vicsicard@gmail.com';
const ADMIN_PASSWORD = 'Jerrygarcia1993!';

// Authentication middleware
const authMiddleware = async (req, res, next) => {
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

// Protect API routes
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized - Please login' });
  }
  next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  next();
};

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

// Get current user
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// API endpoints for each collection with auth protection
const collections = ['sites', 'blogposts', 'socialposts', 'biocards', 'quotes', 'media'];

collections.forEach(collection => {
  // Get all items (admin sees all, users see only their own)
  app.get(`/api/${collection}`, requireAuth, async (req, res) => {
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
      
      const data = await db.collection(collection).find(query).toArray();
      res.json(data);
    } catch (err) {
      console.error(`Error fetching ${collection}:`, err);
      res.status(500).json({ error: err.message });
    } finally {
      if (client) await client.close();
    }
  });

  // Get item by ID (with auth check)
  app.get(`/api/${collection}/:id`, requireAuth, async (req, res) => {
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      const item = await db.collection(collection).findOne({ _id: new ObjectId(req.params.id) });
      
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      
      // Check if user has access to this item
      if (req.user.role !== 'admin' && item.userId && item.userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(item);
    } catch (err) {
      console.error(`Error fetching ${collection} by ID:`, err);
      res.status(500).json({ error: err.message });
    } finally {
      if (client) await client.close();
    }
  });
});

// Admin-only: List all users
app.get('/api/users', requireAdmin, async (req, res) => {
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

// Admin-only: Create user
app.post('/api/users', requireAdmin, async (req, res) => {
  const { email, password, name, role = 'user' } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = {
      email,
      password: hashedPassword,
      name: name || '',
      role: role === 'admin' ? 'admin' : 'user',
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Create a site for the user
    const site = {
      userId: result.insertedId.toString(),
      title: `${name || email}'s Site`,
      createdAt: new Date()
    };
    
    await db.collection('sites').insertOne(site);
    
    // Return user without password
    const { password: pwd, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      ...userWithoutPassword,
      id: result.insertedId.toString()
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
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

// Admin dashboard with auth check
app.get('/', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
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
        .admin-only { display: ${req.user.role === 'admin' ? 'block' : 'none'}; }
        
        /* Client Selector Styles */
        .client-selector {
          background-color: #f0f4f8;
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        }
        .selector-wrapper {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .selector-wrapper label {
          font-weight: bold;
          color: #333;
          margin-right: 5px;
        }
        #client-select {
          flex-grow: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          max-width: 400px;
        }
        .view-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .view-btn:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Self Cast Studios Admin</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <!-- Admin-only client selector - only visible to admin -->
      <div class="client-selector admin-only">
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
          if (!document.querySelector('.admin-only')) {
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
              option.textContent = user.name ? `${user.name} (${user.email})` : user.email;
              clientSelect.appendChild(option);
            });
            
            // Handle view client button
            document.getElementById('view-client-btn').addEventListener('click', () => {
              const selectedClientId = clientSelect.value;
              if (selectedClientId) {
                // Redirect to client-specific view or filter current view
                // For now, we'll just filter the API calls to show only this client's data
                localStorage.setItem('selectedClientId', selectedClientId);
                alert(`Now viewing client ID: ${selectedClientId}`);
                // Refresh data displays
                fetchClientData(selectedClientId);
              } else {
                // Reset to view all clients
                localStorage.removeItem('selectedClientId');
                alert('Now viewing all clients');
                // Refresh data displays
                fetchClientData(null);
              }
            });
            
            // Check if we have a previously selected client
            const savedClientId = localStorage.getItem('selectedClientId');
            if (savedClientId) {
              clientSelect.value = savedClientId;
              fetchClientData(savedClientId);
            }
            
          } catch (error) {
            console.error('Error fetching client list:', error);
          }
        };
        
        // Fetch client-specific data
        const fetchClientData = async (clientId) => {
          // This function would fetch and display data specific to the selected client
          // For now, we'll just update the UI to indicate which client is selected
          const clientDisplay = document.createElement('div');
          clientDisplay.id = 'client-display';
          clientDisplay.style.padding = '10px';
          clientDisplay.style.margin = '10px 0';
          clientDisplay.style.backgroundColor = '#e6f7ff';
          clientDisplay.style.borderRadius = '4px';
          
          if (clientId) {
            // Find the client name from the select
            const clientSelect = document.getElementById('client-select');
            const selectedOption = Array.from(clientSelect.options).find(option => option.value === clientId);
            const clientName = selectedOption ? selectedOption.textContent : clientId;
            
            clientDisplay.innerHTML = `<strong>Currently viewing:</strong> ${clientName}`;
          } else {
            clientDisplay.innerHTML = '<strong>Currently viewing:</strong> All Clients';
          }
          
          // Replace any existing display
          const existingDisplay = document.getElementById('client-display');
          if (existingDisplay) {
            existingDisplay.replaceWith(clientDisplay);
          } else {
            // Insert after the first card
            const firstCard = document.querySelector('.card');
            if (firstCard) {
              firstCard.parentNode.insertBefore(clientDisplay, firstCard.nextSibling);
            }
          }
        };
        
        // Initialize client list for admin
        populateClientList();
      </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = 3002;
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
