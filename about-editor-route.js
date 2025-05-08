// About Page Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create router
const router = express.Router();

// About Page Editor Route
router.get('/editor/about', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the about page editor
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>About Page Editor - Self Cast Studios CMS</title>
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
        .image-preview { margin-top: 10px; max-width: 200px; max-height: 200px; border-radius: 4px; }
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
        <h1>About Page Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/about">About Page Editor</a>
        </div>
        
        <div id="editor-content">
          <!-- Page Header Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Page Header</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="about-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label for="about-title">Title</label>
              <input type="text" id="about-title" class="form-control" placeholder="About Me">
            </div>
            <div class="form-group">
              <label for="about-subtitle">Subtitle</label>
              <input type="text" id="about-subtitle" class="form-control" placeholder="Professional podcast and media production services">
            </div>
          </div>
          
          <!-- Profile Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Profile Section</h2>
            </div>
            <div class="form-group">
              <label for="profile-image">Profile Picture</label>
              <input type="file" id="profile-image" accept="image/*">
              <div id="profile-preview" class="image-preview"></div>
            </div>
          </div>
          
          <!-- About Content Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>About Content</h2>
            </div>
            <div class="form-group">
              <label for="content-subheading">Content Subheading</label>
              <input type="text" id="content-subheading" class="form-control" placeholder="About Self Cast Studios">
            </div>
            <div class="form-group">
              <label for="about-content">About Text</label>
              <textarea id="about-content" class="form-control" placeholder="Main paragraph about Self Cast Studios" rows="6"></textarea>
            </div>
          </div>
          
          <!-- Contact Information Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Contact Information</h2>
            </div>
            <div class="form-group">
              <label for="contact-heading">Section Heading</label>
              <input type="text" id="contact-heading" class="form-control" placeholder="Contact Information">
            </div>
            <div class="form-group">
              <label for="business-name">Business Name</label>
              <input type="text" id="business-name" class="form-control" placeholder="Self Cast Studios">
            </div>
            <div class="form-group">
              <label for="contact-email">Email</label>
              <input type="email" id="contact-email" class="form-control" placeholder="contact@example.com">
            </div>
            <div class="form-group">
              <label for="contact-phone">Phone</label>
              <input type="tel" id="contact-phone" class="form-control" placeholder="(123) 456-7890">
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
      </div>
      
      <script src="/js/about-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save about page data
router.post('/api/about/save', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { aboutData } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Update site data with about page information
      if (aboutData) {
        const siteFilter = { userId: clientId };
        const site = await db.collection('sites').findOne(siteFilter);
        
        if (site) {
          // Update existing site with about page data
          await db.collection('sites').updateOne(
            siteFilter,
            { 
              $set: {
                'about.title': aboutData.title,
                'about.subtitle': aboutData.subtitle,
                'about.profileImage': aboutData.profileImage,
                'about.contentSubheading': aboutData.contentSubheading,
                'about.content': aboutData.content,
                'about.contactHeading': aboutData.contactHeading,
                'about.contact.businessName': aboutData.contact.businessName,
                'about.contact.email': aboutData.contact.email,
                'about.contact.phone': aboutData.contact.phone,
                'about.visible': aboutData.visible,
                updatedAt: new Date()
              }
            }
          );
        } else {
          // Create new site with about page data
          await db.collection('sites').insertOne({
            userId: clientId,
            about: {
              title: aboutData.title,
              subtitle: aboutData.subtitle,
              profileImage: aboutData.profileImage,
              contentSubheading: aboutData.contentSubheading,
              content: aboutData.content,
              contactHeading: aboutData.contactHeading,
              contact: {
                businessName: aboutData.contact.businessName,
                email: aboutData.contact.email,
                phone: aboutData.contact.phone
              },
              visible: aboutData.visible
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      res.json({ success: true });
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error saving about page data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
