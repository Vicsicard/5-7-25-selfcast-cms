// Client Manager Module for Self Cast Studios CMS
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create router
const router = express.Router();

// Get all clients (admin only)
router.get('/clients', async (req, res) => {
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
      .find({ role: 'client' })
      .project({ password: 0, plainPassword: 0 })
      .toArray();
    
    res.json(users);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
});

// Create new client (admin only)
router.post('/clients', async (req, res) => {
  // Check if admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { email, password, name, role = 'client' } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  let client;
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      createdBy: req.user.id
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Create initial site configuration for the new client
    const initialSite = {
      userId: result.insertedId.toString(),
      title: name || 'New Client Site',
      createdAt: new Date(),
      pages: {
        home: { visible: true },
        about: { visible: true },
        blog: { visible: true },
        projects: { visible: true },
        social: { visible: true },
        contact: { visible: true }
      }
    };
    
    await db.collection('sites').insertOne(initialSite);
    
    // Return user without password
    const { password: pwd, ...userWithoutPassword } = newUser;
    res.status(201).json({
      ...userWithoutPassword,
      id: result.insertedId.toString()
    });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) await client.close();
  }
});

// Client management page
router.get('/manage-clients', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // If not admin, redirect to dashboard
  if (req.user.role !== 'admin') {
    return res.redirect('/');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Client Management - Self Cast Studios CMS</title>
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
        .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #334155; }
        input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
        .btn { padding: 10px 15px; border-radius: 4px; font-weight: bold; cursor: pointer; border: none; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-success { background: #10b981; color: white; }
        .client-list { margin-top: 20px; }
        .client-item { padding: 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .client-item:last-child { border-bottom: none; }
        .client-name { font-weight: bold; }
        .client-email { color: #64748b; }
        .message { padding: 10px; border-radius: 4px; margin-bottom: 15px; }
        .message.success { background: #d1fae5; color: #065f46; }
        .message.error { background: #fee2e2; color: #b91c1c; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Client Management</h1>
        <div class="user-info">
          <div class="user-badge">Admin: ' + req.user.email + '</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/manage-clients">Client Management</a>
        </div>
        
        <div class="card">
          <h2>Create New Client</h2>
          <div id="message" style="display: none;"></div>
          
          <form id="create-client-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required>
            </div>
            
            <div class="form-group">
              <label for="name">Client Name</label>
              <input type="text" id="name">
            </div>
            
            <button type="submit" class="btn btn-success">Create Client</button>
          </form>
        </div>
        
        <div class="card">
          <h2>Client List</h2>
          <div id="client-list" class="client-list">
            <p>Loading clients...</p>
          </div>
        </div>
      </div>
      
      <script>
        // Logout functionality
        document.getElementById('logout-btn').addEventListener('click', async () => {
          try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
          } catch (error) {
            console.error('Logout failed:', error);
          }
        });
        
        // Load client list
        const loadClients = async () => {
          try {
            const response = await fetch('/api/clients');
            
            if (!response.ok) {
              throw new Error('Failed to fetch clients');
            }
            
            const clients = await response.json();
            const clientListElement = document.getElementById('client-list');
            
            if (clients.length === 0) {
              clientListElement.innerHTML = '<p>No clients found.</p>';
              return;
            }
            
            // Sort clients alphabetically by name or email
            const sortedClients = clients.sort((a, b) => {
              const nameA = a.name || a.email || '';
              const nameB = b.name || b.email || '';
              return nameA.localeCompare(nameB);
            });
            
            // Create client list HTML
            clientListElement.innerHTML = '';
            sortedClients.forEach(client => {
              const clientElement = document.createElement('div');
              clientElement.className = 'client-item';
              
              const clientInfo = document.createElement('div');
              clientInfo.innerHTML = 
                '<div class="client-name">' + (client.name || 'Unnamed Client') + '</div>' +
                '<div class="client-email">' + client.email + '</div>';
              
              const clientActions = document.createElement('div');
              const viewButton = document.createElement('button');
              viewButton.className = 'btn btn-primary';
              viewButton.textContent = 'View Client';
              viewButton.addEventListener('click', () => {
                localStorage.setItem('selectedClientId', client._id || client.id);
                window.location.href = '/';
              });
              
              clientActions.appendChild(viewButton);
              clientElement.appendChild(clientInfo);
              clientElement.appendChild(clientActions);
              clientListElement.appendChild(clientElement);
            });
          } catch (error) {
            console.error('Error loading clients:', error);
            document.getElementById('client-list').innerHTML = '<p>Error loading clients. Please try again.</p>';
          }
        };
        
        // Create client form submission
        document.getElementById('create-client-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const name = document.getElementById('name').value;
          const messageElement = document.getElementById('message');
          
          try {
            messageElement.style.display = 'none';
            
            const response = await fetch('/api/clients', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password, name, role: 'client' })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to create client');
            }
            
            // Success
            messageElement.className = 'message success';
            messageElement.textContent = `Client ${name || email} created successfully!`;
            messageElement.style.display = 'block';
            
            // Clear form
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('name').value = '';
            
            // Reload client list
            setTimeout(loadClients, 1000);
          } catch (error) {
            messageElement.className = 'message error';
            messageElement.textContent = error.message;
            messageElement.style.display = 'block';
          }
        });
        
        // Initialize
        loadClients();
      </script>
    </body>
    </html>
  `);
});

module.exports = router;
