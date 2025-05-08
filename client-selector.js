// Client Selector Module for Self Cast Studios CMS
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
        
        <div class="card admin-only">
          <h2>User Management</h2>
          <p>Manage user accounts:</p>
          <a href="/api/users" class="button">View All Users</a>
        </div>
        
        <div class="card">
          <h2>Website Editor</h2>
          <p>Edit your website content:</p>
          <div class="editor-nav">
            <a href="/editor/home" class="button">Home Page</a>
            <a href="#" class="button disabled">About Page</a>
            <a href="#" class="button disabled">Blog</a>
            <a href="#" class="button disabled">Projects</a>
            <a href="#" class="button disabled">Social</a>
            <a href="#" class="button disabled">Contact</a>
            <a href="#" class="button disabled">Global Components</a>
          </div>
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

// Homepage Editor Route
app.get('/editor/home', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Homepage Editor - Self Cast Studios CMS</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f7; }
        .header { background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; color: white; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; }
        .user-info { display: flex; align-items: center; }
        .user-badge { background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; margin-right: 10px; }
        .logout-btn { background: rgba(0,0,0,0.1); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .breadcrumb { display: flex; align-items: center; margin-bottom: 20px; }
        .breadcrumb a { color: #3b82f6; text-decoration: none; }
        .breadcrumb span { margin: 0 10px; color: #64748b; }
        .section-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
        .section-header h2 { margin: 0; color: #1e293b; }
        .toggle-switch { position: relative; display: inline-block; width: 60px; height: 34px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
        .toggle-slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: #3b82f6; }
        input:checked + .toggle-slider:before { transform: translateX(26px); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #334155; }
        .form-control { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 16px; }
        .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        textarea.form-control { min-height: 100px; }
        .color-picker { width: 50px; height: 50px; padding: 0; border: none; }
        .image-preview { margin-top: 10px; max-width: 200px; max-height: 200px; border-radius: 4px; }
        .quote-card { background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
        .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn { padding: 10px 15px; border-radius: 4px; font-weight: bold; cursor: pointer; border: none; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: #64748b; color: white; }
        .btn-success { background: #10b981; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn:hover { opacity: 0.9; }
        .save-indicator { display: none; margin-right: 10px; color: #10b981; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Homepage Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/home">Homepage Editor</a>
        </div>
        
        <div id="editor-content">
          <div class="section-card">
            <div class="section-header">
              <h2>Hero Section</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="hero-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label for="hero-title">Hero Title</label>
              <input type="text" id="hero-title" class="form-control" placeholder="Your site title">
            </div>
            <div class="form-group">
              <label for="hero-tagline">Hero Subtitle/Tagline</label>
              <input type="text" id="hero-tagline" class="form-control" placeholder="Your site tagline">
            </div>
            <div class="form-group">
              <label for="profile-image">Profile Picture</label>
              <input type="file" id="profile-image" accept="image/*">
              <div id="profile-preview" class="image-preview"></div>
            </div>
          </div>
          
          <div class="section-card">
            <div class="section-header">
              <h2>About Section</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="about-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="quote-card">
              <div class="form-group">
                <label for="quote1-content">Quote Card 1 Content</label>
                <textarea id="quote1-content" class="form-control" placeholder="Quote content"></textarea>
              </div>
              <div class="form-group">
                <label for="quote1-author">Quote Card 1 Author</label>
                <input type="text" id="quote1-author" class="form-control" placeholder="Author name">
              </div>
            </div>
            <div class="quote-card">
              <div class="form-group">
                <label for="quote2-content">Quote Card 2 Content</label>
                <textarea id="quote2-content" class="form-control" placeholder="Quote content"></textarea>
              </div>
              <div class="form-group">
                <label for="quote2-author">Quote Card 2 Author</label>
                <input type="text" id="quote2-author" class="form-control" placeholder="Author name">
              </div>
            </div>
            <div class="quote-card">
              <div class="form-group">
                <label for="quote3-content">Quote Card 3 Content</label>
                <textarea id="quote3-content" class="form-control" placeholder="Quote content"></textarea>
              </div>
              <div class="form-group">
                <label for="quote3-author">Quote Card 3 Author</label>
                <input type="text" id="quote3-author" class="form-control" placeholder="Author name">
              </div>
            </div>
          </div>
          
          <div class="section-card">
            <div class="section-header">
              <h2>Banner Section 1</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="banner1-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label for="banner1-title">Banner Title 1</label>
              <input type="text" id="banner1-title" class="form-control" placeholder="Banner title">
            </div>
            <div class="form-group">
              <label for="banner1-caption">Banner Caption 1</label>
              <textarea id="banner1-caption" class="form-control" placeholder="Banner caption"></textarea>
            </div>
            <div class="form-group">
              <label for="banner1-image">Banner Image 1</label>
              <input type="file" id="banner1-image" accept="image/*">
              <div id="banner1-preview" class="image-preview"></div>
            </div>
          </div>
          
          <div class="section-card">
            <div class="section-header">
              <h2>Banner Section 2</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="banner2-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label for="banner2-title">Banner Title 2</label>
              <input type="text" id="banner2-title" class="form-control" placeholder="Banner title">
            </div>
            <div class="form-group">
              <label for="banner2-caption">Banner Caption 2</label>
              <textarea id="banner2-caption" class="form-control" placeholder="Banner caption"></textarea>
            </div>
            <div class="form-group">
              <label for="banner2-image">Banner Image 2</label>
              <input type="file" id="banner2-image" accept="image/*">
              <div id="banner2-preview" class="image-preview"></div>
            </div>
          </div>
          
          <div class="section-card">
            <div class="section-header">
              <h2>Social Media Section</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="social-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p>Select social media posts to display on your homepage:</p>
            <div id="social-posts-container">
              <!-- Social posts will be loaded here -->
              <p>Loading social media posts...</p>
            </div>
          </div>
          
          <div class="section-card">
            <div class="section-header">
              <h2>Blog Posts Section</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="blog-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p>Select blog posts to feature on your homepage:</p>
            <div id="blog-posts-container">
              <!-- Blog posts will be loaded here -->
              <p>Loading blog posts...</p>
            </div>
          </div>
          
          <div class="section-card">
            <div class="section-header">
              <h2>Contact Section</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="contact-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label for="contact-info">Contact Information</label>
              <textarea id="contact-info" class="form-control" placeholder="Your contact information"></textarea>
            </div>
          </div>
          
          <div class="btn-row">
            <span id="save-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
      </div>
      
      <script>
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
        
        // Get the client ID (if admin has selected one)
        const selectedClientId = localStorage.getItem('selectedClientId');
        
        // Load homepage data
        const loadHomepageData = async () => {
          try {
            // Fetch site data
            let siteUrl = '/api/sites';
            if (selectedClientId) {
              siteUrl += '?clientId=' + selectedClientId;
            }
            
            const siteResponse = await fetch(siteUrl);
            if (!siteResponse.ok) throw new Error('Failed to load site data');
            const sites = await siteResponse.json();
            
            // Get the first site (or the one matching the selected client)
            const site = sites[0];
            
            if (site) {
              // Populate hero section
              document.getElementById('hero-title').value = site.title || site.headline || '';
              document.getElementById('hero-tagline').value = site.tagline || site.description || '';
              document.getElementById('hero-visible').checked = site.sections?.hero?.visible !== false;
              
              // Populate about section visibility
              document.getElementById('about-visible').checked = site.sections?.about?.visible !== false;
              
              // Populate banner sections
              if (site.banners && site.banners.length > 0) {
                if (site.banners[0]) {
                  document.getElementById('banner1-title').value = site.banners[0].title || '';
                  document.getElementById('banner1-caption').value = site.banners[0].caption || '';
                  document.getElementById('banner1-visible').checked = site.sections?.banner1?.visible !== false;
                }
                
                if (site.banners[1]) {
                  document.getElementById('banner2-title').value = site.banners[1].title || '';
                  document.getElementById('banner2-caption').value = site.banners[1].caption || '';
                  document.getElementById('banner2-visible').checked = site.sections?.banner2?.visible !== false;
                }
              }
              
              // Populate section visibility
              document.getElementById('social-visible').checked = site.sections?.socialMedia?.visible !== false;
              document.getElementById('blog-visible').checked = site.sections?.blogPosts?.visible !== false;
              document.getElementById('contact-visible').checked = site.sections?.contact?.visible !== false;
              
              // Populate contact info
              document.getElementById('contact-info').value = site.contactInfo || '';
            }
            
            // Fetch quotes
            let quotesUrl = '/api/quotes';
            if (selectedClientId) {
              quotesUrl += '?clientId=' + selectedClientId;
            }
            
            const quotesResponse = await fetch(quotesUrl);
            if (!quotesResponse.ok) throw new Error('Failed to load quotes');
            const quotes = await quotesResponse.json();
            
            // Populate quote cards
            if (quotes.length > 0) {
              document.getElementById('quote1-content').value = quotes[0]?.content || '';
              document.getElementById('quote1-author').value = quotes[0]?.author || '';
            }
            
            if (quotes.length > 1) {
              document.getElementById('quote2-content').value = quotes[1]?.content || '';
              document.getElementById('quote2-author').value = quotes[1]?.author || '';
            }
            
            if (quotes.length > 2) {
              document.getElementById('quote3-content').value = quotes[2]?.content || '';
              document.getElementById('quote3-author').value = quotes[2]?.author || '';
            }
            
            // Load social posts
            loadSocialPosts();
            
            // Load blog posts
            loadBlogPosts();
            
          } catch (error) {
            console.error('Error loading homepage data:', error);
            alert('Failed to load homepage data. Please try again.');
          }
        };
        
        // Load social media posts
        const loadSocialPosts = async () => {
          try {
            let socialUrl = '/api/socialposts';
            if (selectedClientId) {
              socialUrl += '?clientId=' + selectedClientId;
            }
            
            const response = await fetch(socialUrl);
            if (!response.ok) throw new Error('Failed to load social posts');
            const posts = await response.json();
            
            const container = document.getElementById('social-posts-container');
            
            if (posts.length === 0) {
              container.innerHTML = '<p>No social media posts found. Create some posts to display them here.</p>';
              return;
            }
            
            // Group posts by platform
            const platforms = ['linkedin', 'instagram', 'facebook', 'twitter'];
            let html = '';
            
            platforms.forEach(platform => {
              const platformPosts = posts.filter(post => post.platform === platform);
              
              if (platformPosts.length > 0) {
                html += `<h3>${platform.charAt(0).toUpperCase() + platform.slice(1)} Posts</h3>`;
                html += '<div class="form-group">';
                
                platformPosts.forEach(post => {
                  const postId = post._id || post.id;
                  const postContent = post.content || '';
                  const truncatedContent = postContent.length > 100 ? 
                    postContent.substring(0, 100) + '...' : 
                    postContent;
                  const checkedAttr = post.featured ? 'checked' : '';
                  
                  html += '<div class="quote-card">';
                  html += '<input type="checkbox" id="social-' + postId + '" class="social-post-checkbox" data-id="' + postId + '" ' + checkedAttr + '>';
                  html += '<label for="social-' + postId + '">' + truncatedContent + '</label>';
                  html += '</div>';
                });
                
                html += '</div>';
              }
            });
            
            container.innerHTML = html || '<p>No social media posts found. Create some posts to display them here.</p>';
            
          } catch (error) {
            console.error('Error loading social posts:', error);
            document.getElementById('social-posts-container').innerHTML = 
              '<p>Failed to load social media posts. Please try again.</p>';
          }
        };
        
        // Load blog posts
        const loadBlogPosts = async () => {
          try {
            let blogUrl = '/api/blogposts';
            if (selectedClientId) {
              blogUrl += '?clientId=' + selectedClientId;
            }
            
            const response = await fetch(blogUrl);
            if (!response.ok) throw new Error('Failed to load blog posts');
            const posts = await response.json();
            
            const container = document.getElementById('blog-posts-container');
            
            if (posts.length === 0) {
              container.innerHTML = '<p>No blog posts found. Create some posts to display them here.</p>';
              return;
            }
            
            let html = '<div class="form-group">';
            
            posts.forEach(post => {
              const postId = post._id || post.id;
              const postTitle = post.title || '';
              const checkedAttr = post.featured ? 'checked' : '';
              
              html += '<div class="quote-card">';
              html += '<input type="checkbox" id="blog-' + postId + '" class="blog-post-checkbox" data-id="' + postId + '" ' + checkedAttr + '>';
              html += '<label for="blog-' + postId + '">' + postTitle + '</label>';
              html += '</div>';
            });
            
            html += '</div>';
            
            container.innerHTML = html;
            
          } catch (error) {
            console.error('Error loading blog posts:', error);
            document.getElementById('blog-posts-container').innerHTML = 
              '<p>Failed to load blog posts. Please try again.</p>';
          }
        };
        
        // Save changes
        document.getElementById('save-btn').addEventListener('click', async () => {
          try {
            // Collect data from form
            const siteData = {
              title: document.getElementById('hero-title').value,
              tagline: document.getElementById('hero-tagline').value,
              sections: {
                hero: { visible: document.getElementById('hero-visible').checked },
                about: { visible: document.getElementById('about-visible').checked },
                banner1: { visible: document.getElementById('banner1-visible').checked },
                banner2: { visible: document.getElementById('banner2-visible').checked },
                socialMedia: { visible: document.getElementById('social-visible').checked },
                blogPosts: { visible: document.getElementById('blog-visible').checked },
                contact: { visible: document.getElementById('contact-visible').checked }
              },
              banners: [
                {
                  title: document.getElementById('banner1-title').value,
                  caption: document.getElementById('banner1-caption').value
                },
                {
                  title: document.getElementById('banner2-title').value,
                  caption: document.getElementById('banner2-caption').value
                }
              ],
              contactInfo: document.getElementById('contact-info').value
            };
            
            // Collect quote data
            const quoteData = [
              {
                content: document.getElementById('quote1-content').value,
                author: document.getElementById('quote1-author').value
              },
              {
                content: document.getElementById('quote2-content').value,
                author: document.getElementById('quote2-author').value
              },
              {
                content: document.getElementById('quote3-content').value,
                author: document.getElementById('quote3-author').value
              }
            ];
            
            // Collect selected social posts
            const socialPostCheckboxes = document.querySelectorAll('.social-post-checkbox');
            const selectedSocialPosts = Array.from(socialPostCheckboxes)
              .filter(checkbox => checkbox.checked)
              .map(checkbox => checkbox.dataset.id);
            
            // Collect selected blog posts
            const blogPostCheckboxes = document.querySelectorAll('.blog-post-checkbox');
            const selectedBlogPosts = Array.from(blogPostCheckboxes)
              .filter(checkbox => checkbox.checked)
              .map(checkbox => checkbox.dataset.id);
            
            // TODO: Send data to server
            // For now, just show a success message
            const saveIndicator = document.getElementById('save-indicator');
            saveIndicator.style.display = 'inline';
            
            setTimeout(() => {
              saveIndicator.style.display = 'none';
            }, 3000);
            
            alert('Changes saved successfully! (Note: This is a demo - actual saving to the database will be implemented next)');
            
          } catch (error) {
            console.error('Error saving changes:', error);
            alert('Failed to save changes. Please try again.');
          }
        });
        
        // Preview changes
        document.getElementById('preview-btn').addEventListener('click', () => {
          alert('Preview functionality will be implemented in the next phase.');
        });
        
        // Publish to website
        document.getElementById('publish-btn').addEventListener('click', () => {
          alert('Publish functionality will be implemented in the next phase.');
        });
        
        // Image preview functionality
        const setupImagePreview = (inputId, previewId) => {
          const input = document.getElementById(inputId);
          const preview = document.getElementById(previewId);
          
          input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                preview.innerHTML = '<img src="' + event.target.result + '" alt="Preview" class="image-preview">'; 
              };
              reader.readAsDataURL(file);
            }
          });
        };
        
        // Setup image previews
        setupImagePreview('profile-image', 'profile-preview');
        setupImagePreview('banner1-image', 'banner1-preview');
        setupImagePreview('banner2-image', 'banner2-preview');
        
        // Load data when page loads
        loadHomepageData();
      </script>
    </body>
    </html>
  `);
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
const PORT = 3003;
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
