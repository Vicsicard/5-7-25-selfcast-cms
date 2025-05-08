// Global Components Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create router
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Global Components Editor Route
router.get('/editor/global', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the global components editor
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Global Components Editor - Self Cast Studios CMS</title>
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
        .image-preview { margin-top: 10px; max-width: 200px; max-height: 200px; border-radius: 4px; display: none; }
        .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn { padding: 10px 15px; border-radius: 4px; font-weight: bold; cursor: pointer; border: none; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: #64748b; color: white; }
        .btn-success { background: #10b981; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn:hover { opacity: 0.9; }
        .save-indicator { display: none; margin-right: 10px; color: #10b981; }
        .tab-container { border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }
        .tabs { display: flex; gap: 5px; }
        .tab { padding: 10px 15px; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .field-group { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .field-group-title { font-weight: bold; margin-bottom: 15px; color: #64748b; }
        .admin-only { display: none; }
        body.is-admin .admin-only { display: block; }
        .color-preview { width: 30px; height: 30px; display: inline-block; border-radius: 4px; vertical-align: middle; margin-left: 10px; border: 1px solid #e2e8f0; }
        .nav-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e2e8f0; }
        .nav-item:last-child { border-bottom: none; }
        .nav-item-controls { display: flex; align-items: center; gap: 10px; }
        .file-upload { display: flex; align-items: center; gap: 10px; }
        .file-upload-label { display: inline-block; padding: 8px 12px; background: #e2e8f0; border-radius: 4px; cursor: pointer; }
        .file-upload-label:hover { background: #cbd5e1; }
        .file-upload input[type="file"] { display: none; }
      </style>
      <script>
        // Set user role class on body
        document.addEventListener('DOMContentLoaded', function() {
          const userRole = '${req.user.role}';
          if (userRole === 'admin') {
            document.body.classList.add('is-admin');
          }
        });
      </script>
    </head>
    <body>
      <div class="header">
        <h1>Global Components Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/global">Global Components Editor</a>
        </div>
        
        <div class="tab-container">
          <div class="tabs">
            <div class="tab active" data-tab="brand-settings">Brand Settings</div>
            <div class="tab" data-tab="header-settings">Header Settings</div>
            <div class="tab" data-tab="footer-settings">Footer Settings</div>
          </div>
        </div>
        
        <!-- Brand Settings Tab -->
        <div id="brand-settings" class="tab-content active">
          <!-- Brand Elements -->
          <div class="section-card">
            <div class="section-header">
              <h2>Brand Elements</h2>
            </div>
            
            <div class="form-group">
              <label for="site-title">Site Title</label>
              <input type="text" id="site-title" class="form-control" placeholder="Self Cast Studios">
            </div>
            
            <div class="form-group">
              <label for="site-tagline">Tagline</label>
              <input type="text" id="site-tagline" class="form-control" placeholder="Your podcast production partner">
            </div>
            
            <div class="form-group">
              <label for="primary-color">Primary Color</label>
              <div style="display: flex; align-items: center;">
                <input type="color" id="primary-color" class="form-control" value="#0047AB" style="width: 100px;">
                <div id="color-preview" class="color-preview" style="background-color: #0047AB;"></div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="logo-upload">Site Logo</label>
              <div class="file-upload">
                <label class="file-upload-label">
                  Choose File
                  <input type="file" id="logo-upload" accept="image/*">
                </label>
                <span id="file-name">No file chosen</span>
              </div>
              <img id="logo-preview" class="image-preview" src="" alt="Logo Preview">
            </div>
          </div>
          
          <!-- Fixed Theme Elements -->
          <div class="section-card">
            <div class="section-header">
              <h2>Fixed Theme Elements</h2>
              <p>These elements are fixed in the theme and cannot be customized</p>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">Secondary Colors</div>
              <p>The theme includes a set of secondary colors that complement the primary color.</p>
              <div style="display: flex; gap: 10px; margin-top: 10px;">
                <div style="width: 30px; height: 30px; background-color: #4CAF50; border-radius: 4px;"></div>
                <div style="width: 30px; height: 30px; background-color: #FF9800; border-radius: 4px;"></div>
                <div style="width: 30px; height: 30px; background-color: #9C27B0; border-radius: 4px;"></div>
                <div style="width: 30px; height: 30px; background-color: #F44336; border-radius: 4px;"></div>
              </div>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">Typography</div>
              <p>The theme uses the following fonts:</p>
              <ul>
                <li><strong>Headings:</strong> Montserrat</li>
                <li><strong>Body Text:</strong> Inter</li>
              </ul>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">UI Component Styles</div>
              <p>The theme includes styled UI components like buttons, cards, and form elements.</p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-brand-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-brand-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
        
        <!-- Header Settings Tab -->
        <div id="header-settings" class="tab-content">
          <div class="section-card">
            <div class="section-header">
              <h2>Header Components</h2>
            </div>
            
            <div class="form-group">
              <label>Display Options</label>
              <div style="margin-top: 10px;">
                <label style="display: inline-flex; align-items: center; margin-right: 20px;">
                  <input type="checkbox" id="show-logo" checked style="margin-right: 5px;">
                  Show Logo
                </label>
                <label style="display: inline-flex; align-items: center;">
                  <input type="checkbox" id="show-title" checked style="margin-right: 5px;">
                  Show Site Title
                </label>
              </div>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">Navigation Labels</div>
              <p>Customize the text displayed in the navigation menu</p>
              
              <div class="nav-item">
                <div>Home Page</div>
                <div class="nav-item-controls">
                  <input type="text" id="home-label" class="form-control" placeholder="Home" style="width: 150px;">
                  <label class="toggle-switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="home-visible" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="nav-item">
                <div>About Page</div>
                <div class="nav-item-controls">
                  <input type="text" id="about-label" class="form-control" placeholder="About" style="width: 150px;">
                  <label class="toggle-switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="about-visible" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="nav-item">
                <div>Blog Page</div>
                <div class="nav-item-controls">
                  <input type="text" id="blog-label" class="form-control" placeholder="Blog" style="width: 150px;">
                  <label class="toggle-switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="blog-visible" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="nav-item">
                <div>Projects Page</div>
                <div class="nav-item-controls">
                  <input type="text" id="projects-label" class="form-control" placeholder="Projects" style="width: 150px;">
                  <label class="toggle-switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="projects-visible" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="nav-item">
                <div>Social Media Page</div>
                <div class="nav-item-controls">
                  <input type="text" id="social-label" class="form-control" placeholder="Social" style="width: 150px;">
                  <label class="toggle-switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="social-visible" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <div class="nav-item">
                <div>Contact Page</div>
                <div class="nav-item-controls">
                  <input type="text" id="contact-label" class="form-control" placeholder="Contact" style="width: 150px;">
                  <label class="toggle-switch" style="transform: scale(0.8);">
                    <input type="checkbox" id="contact-visible" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">Fixed Header Elements</div>
              <p>These elements are fixed in the theme and cannot be customized</p>
              
              <ul>
                <li><strong>Mobile Menu:</strong> Collapses on small screens</li>
                <li><strong>Header Style:</strong> Sticky, transparent on scroll</li>
              </ul>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-header-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-header-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
        
        <!-- Footer Settings Tab -->
        <div id="footer-settings" class="tab-content">
          <div class="section-card">
            <div class="section-header">
              <h2>Footer Components</h2>
            </div>
            
            <div class="form-group">
              <label>Display Options</label>
              <div style="margin-top: 10px;">
                <label style="display: block; margin-bottom: 10px;">
                  <input type="checkbox" id="show-contact-info" checked style="margin-right: 5px;">
                  Show Contact Information
                </label>
                <label style="display: block; margin-bottom: 10px;">
                  <input type="checkbox" id="show-social-icons" checked style="margin-right: 5px;">
                  Show Social Icons
                </label>
                <label style="display: block; margin-bottom: 10px;">
                  <input type="checkbox" id="show-footer-links" checked style="margin-right: 5px;">
                  Show Footer Links
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="copyright-text">Copyright Text</label>
              <input type="text" id="copyright-text" class="form-control" placeholder="© Self Cast Studios">
              <p style="margin-top: 5px; color: #64748b; font-size: 14px;">The current year will be automatically added</p>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">Fixed Footer Elements</div>
              <p>These elements are fixed in the theme and cannot be customized</p>
              
              <ul>
                <li><strong>Footer Layout:</strong> 3-column structure</li>
                <li><strong>Footer Colors:</strong> Dark background, light text</li>
              </ul>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-footer-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-footer-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
      </div>
      
      <script src="/js/global-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save brand settings
router.post('/api/global/save-brand', upload.single('logo'), async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Get client ID from query parameter if present
    const clientId = req.query.clientId || req.user._id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get the site document
    const sitesCollection = db.collection('sites');
    const site = await sitesCollection.findOne({ clientId });
    
    if (!site) {
      await client.close();
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Parse brand settings from request
    let brandSettings;
    if (req.file) {
      // If a file was uploaded
      const logoUrl = `/uploads/${req.file.filename}`;
      
      if (req.body.brandSettings) {
        brandSettings = JSON.parse(req.body.brandSettings);
        brandSettings.logoUrl = logoUrl;
      } else {
        brandSettings = { logoUrl };
      }
    } else {
      // No file uploaded, just get the settings from the body
      brandSettings = req.body.brandSettings;
    }
    
    // Ensure brand object exists
    if (!site.brand) {
      site.brand = {};
    }
    
    // Update brand settings
    site.brand = {
      ...site.brand,
      ...brandSettings,
      updatedAt: new Date()
    };
    
    // Save to database
    await sitesCollection.updateOne({ _id: site._id }, { $set: { brand: site.brand } });
    
    await client.close();
    
    res.json({ success: true, message: 'Brand settings saved successfully' });
    
  } catch (error) {
    console.error('Error saving brand settings:', error);
    res.status(500).json({ error: 'Failed to save brand settings' });
  }
});

// API endpoint to save header settings
router.post('/api/global/save-header', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Get client ID from query parameter if present
    const clientId = req.query.clientId || req.user._id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get the site document
    const sitesCollection = db.collection('sites');
    const site = await sitesCollection.findOne({ clientId });
    
    if (!site) {
      await client.close();
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Update the site document with header settings
    const headerSettings = req.body.headerSettings;
    
    // Ensure header object exists
    if (!site.header) {
      site.header = {};
    }
    
    // Update header settings
    site.header = {
      ...site.header,
      ...headerSettings,
      updatedAt: new Date()
    };
    
    // Save to database
    await sitesCollection.updateOne({ _id: site._id }, { $set: { header: site.header } });
    
    await client.close();
    
    res.json({ success: true, message: 'Header settings saved successfully' });
    
  } catch (error) {
    console.error('Error saving header settings:', error);
    res.status(500).json({ error: 'Failed to save header settings' });
  }
});

// API endpoint to save footer settings
router.post('/api/global/save-footer', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Get client ID from query parameter if present
    const clientId = req.query.clientId || req.user._id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get the site document
    const sitesCollection = db.collection('sites');
    const site = await sitesCollection.findOne({ clientId });
    
    if (!site) {
      await client.close();
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Update the site document with footer settings
    const footerSettings = req.body.footerSettings;
    
    // Ensure footer object exists
    if (!site.footer) {
      site.footer = {};
    }
    
    // Update footer settings
    site.footer = {
      ...site.footer,
      ...footerSettings,
      updatedAt: new Date()
    };
    
    // Save to database
    await sitesCollection.updateOne({ _id: site._id }, { $set: { footer: site.footer } });
    
    await client.close();
    
    res.json({ success: true, message: 'Footer settings saved successfully' });
    
  } catch (error) {
    console.error('Error saving footer settings:', error);
    res.status(500).json({ error: 'Failed to save footer settings' });
  }
});

module.exports = router;
