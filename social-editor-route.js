// Social Media Hub Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create router
const router = express.Router();

// Social Media Hub Editor Route
router.get('/editor/social', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the social media hub editor
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Social Media Hub Editor - Self Cast Studios CMS</title>
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
        .tab-container { border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }
        .tabs { display: flex; gap: 5px; }
        .tab { padding: 10px 15px; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .platform-tabs { display: flex; gap: 5px; margin-bottom: 15px; }
        .platform-tab { padding: 8px 12px; cursor: pointer; border-radius: 4px; border: 1px solid #e2e8f0; }
        .platform-tab.twitter.active { background-color: #1DA1F2; color: white; }
        .platform-tab.linkedin.active { background-color: #0077B5; color: white; }
        .platform-tab.facebook.active { background-color: #1877F2; color: white; }
        .platform-tab.instagram.active { background-color: #E4405F; color: white; }
        .platform-content { display: none; }
        .platform-content.active { display: block; }
        .post-list { max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-top: 10px; }
        .post-item { padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .post-item:last-child { border-bottom: none; }
        .post-item.featured { background-color: rgba(16, 185, 129, 0.1); }
        .post-item-title { font-weight: bold; }
        .post-item-meta { font-size: 12px; color: #64748b; margin-top: 5px; }
        .featured-badge { background-color: #10b981; color: white; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 8px; }
        .featured-post-item { padding: 15px; border: 1px solid #10b981; border-radius: 8px; background-color: rgba(16, 185, 129, 0.1); }
        .featured-post-title { font-weight: bold; margin-bottom: 5px; }
        .featured-post-meta { font-size: 12px; color: #64748b; margin-top: 5px; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }
        .btn-outline { background-color: transparent; border: 1px solid #3b82f6; color: #3b82f6; }
        .post-actions { display: flex; gap: 10px; margin-top: 20px; }
        .platform-icon { width: 24px; height: 24px; margin-right: 10px; }
        .field-group { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .field-group-title { font-weight: bold; margin-bottom: 15px; color: #64748b; }
        .admin-only { display: none; }
        body.is-admin .admin-only { display: block; }
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
        <h1>Social Media Hub Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/social">Social Media Hub Editor</a>
        </div>
        
        <div class="tab-container">
          <div class="tabs">
            <div class="tab active" data-tab="general-settings">General Settings</div>
            <div class="tab" data-tab="manage-posts">Manage Posts</div>
            <div class="tab" data-tab="platform-settings">Platform Settings</div>
          </div>
        </div>
        
        <!-- General Settings Tab -->
        <div id="general-settings" class="tab-content active">
          <!-- Social Hub Settings -->
          <div class="section-card">
            <div class="section-header">
              <h2>Social Hub Settings</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="social-hub-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="form-group">
              <label for="social-hub-title">Hub Title</label>
              <input type="text" id="social-hub-title" class="form-control" placeholder="Social Media Hub">
            </div>
            
            <div class="form-group">
              <label for="social-hub-description">Hub Description</label>
              <textarea id="social-hub-description" class="form-control" placeholder="Connect with us on social media..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="posts-per-page">Posts Per Page</label>
              <input type="number" id="posts-per-page" class="form-control" min="1" max="20" value="6">
            </div>
          </div>
          
          <!-- Featured Posts Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Featured Posts</h2>
              <p>Select posts to feature on your homepage</p>
            </div>
            
            <div class="platform-tabs">
              <div class="platform-tab twitter active" data-platform="twitter">Twitter</div>
              <div class="platform-tab linkedin" data-platform="linkedin">LinkedIn</div>
              <div class="platform-tab facebook" data-platform="facebook">Facebook</div>
              <div class="platform-tab instagram" data-platform="instagram">Instagram</div>
            </div>
            
            <div class="platform-content twitter active" id="twitter-featured">
              <div id="twitter-featured-post">
                <p>No featured Twitter post selected</p>
              </div>
            </div>
            
            <div class="platform-content linkedin" id="linkedin-featured">
              <div id="linkedin-featured-post">
                <p>No featured LinkedIn post selected</p>
              </div>
            </div>
            
            <div class="platform-content facebook" id="facebook-featured">
              <div id="facebook-featured-post">
                <p>No featured Facebook post selected</p>
              </div>
            </div>
            
            <div class="platform-content instagram" id="instagram-featured">
              <div id="instagram-featured-post">
                <p>No featured Instagram post selected</p>
              </div>
            </div>
            
            <div class="btn-row">
              <span id="save-featured-indicator" class="save-indicator">✓ Changes saved</span>
              <button id="save-featured-btn" class="btn btn-primary">Save Featured Posts</button>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-general-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
        
        <!-- Manage Posts Tab -->
        <div id="manage-posts" class="tab-content">
          <div class="section-card">
            <div class="section-header">
              <h2>Manage Social Posts</h2>
              <button id="new-post-btn" class="btn btn-primary">Add New Post</button>
            </div>
            
            <div class="platform-tabs">
              <div class="platform-tab twitter active" data-platform="twitter">Twitter</div>
              <div class="platform-tab linkedin" data-platform="linkedin">LinkedIn</div>
              <div class="platform-tab facebook" data-platform="facebook">Facebook</div>
              <div class="platform-tab instagram" data-platform="instagram">Instagram</div>
            </div>
            
            <div class="platform-content twitter active" id="twitter-posts">
              <div class="post-list" id="twitter-post-list">
                <p>Loading Twitter posts...</p>
              </div>
            </div>
            
            <div class="platform-content linkedin" id="linkedin-posts">
              <div class="post-list" id="linkedin-post-list">
                <p>Loading LinkedIn posts...</p>
              </div>
            </div>
            
            <div class="platform-content facebook" id="facebook-posts">
              <div class="post-list" id="facebook-post-list">
                <p>Loading Facebook posts...</p>
              </div>
            </div>
            
            <div class="platform-content instagram" id="instagram-posts">
              <div class="post-list" id="instagram-post-list">
                <p>Loading Instagram posts...</p>
              </div>
            </div>
          </div>
          
          <!-- Post Editor (hidden initially) -->
          <div id="post-editor" class="section-card" style="display: none;">
            <div class="section-header">
              <h2 id="post-editor-title">New Social Post</h2>
            </div>
            
            <div class="form-group">
              <label for="post-platform">Platform</label>
              <select id="post-platform" class="form-control">
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="post-title">Title (Optional)</label>
              <input type="text" id="post-title" class="form-control" placeholder="Post Title">
            </div>
            
            <div class="form-group">
              <label for="post-content">Content</label>
              <textarea id="post-content" class="form-control" rows="5" placeholder="Write your post content here..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="post-link">Original Post URL (Optional)</label>
              <input type="text" id="post-link" class="form-control" placeholder="https://...">
            </div>
            
            <div class="form-group">
              <label for="post-status">Status</label>
              <select id="post-status" class="form-control">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div class="post-actions">
              <button id="cancel-post-btn" class="btn btn-secondary">Cancel</button>
              <button id="save-post-btn" class="btn btn-primary">Save Post</button>
              <button id="delete-post-btn" class="btn btn-danger" style="display: none;">Delete Post</button>
            </div>
          </div>
        </div>
        
        <!-- Platform Settings Tab -->
        <div id="platform-settings" class="tab-content">
          <div class="section-card">
            <div class="section-header">
              <h2>Platform Settings</h2>
            </div>
            
            <div class="platform-tabs">
              <div class="platform-tab twitter active" data-platform="twitter">Twitter</div>
              <div class="platform-tab linkedin" data-platform="linkedin">LinkedIn</div>
              <div class="platform-tab facebook" data-platform="facebook">Facebook</div>
              <div class="platform-tab instagram" data-platform="instagram">Instagram</div>
            </div>
            
            <!-- Twitter Settings -->
            <div class="platform-content twitter active" id="twitter-settings">
              <div class="field-group">
                <div class="field-group-title">Twitter Profile</div>
                
                <div class="form-group">
                  <label for="twitter-profile-url">Profile URL</label>
                  <input type="text" id="twitter-profile-url" class="form-control" placeholder="https://twitter.com/yourusername">
                </div>
                
                <div class="form-group">
                  <label for="twitter-display-name">Display Name</label>
                  <input type="text" id="twitter-display-name" class="form-control" placeholder="Your Twitter Name">
                </div>
                
                <div class="form-group">
                  <label class="toggle-switch-label">
                    <input type="checkbox" id="twitter-visible" checked>
                    <span class="toggle-slider-text">Show Twitter in Social Hub</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- LinkedIn Settings -->
            <div class="platform-content linkedin" id="linkedin-settings">
              <div class="field-group">
                <div class="field-group-title">LinkedIn Profile</div>
                
                <div class="form-group">
                  <label for="linkedin-profile-url">Profile URL</label>
                  <input type="text" id="linkedin-profile-url" class="form-control" placeholder="https://linkedin.com/in/yourusername">
                </div>
                
                <div class="form-group">
                  <label for="linkedin-display-name">Display Name</label>
                  <input type="text" id="linkedin-display-name" class="form-control" placeholder="Your LinkedIn Name">
                </div>
                
                <div class="form-group">
                  <label class="toggle-switch-label">
                    <input type="checkbox" id="linkedin-visible" checked>
                    <span class="toggle-slider-text">Show LinkedIn in Social Hub</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Facebook Settings -->
            <div class="platform-content facebook" id="facebook-settings">
              <div class="field-group">
                <div class="field-group-title">Facebook Profile</div>
                
                <div class="form-group">
                  <label for="facebook-profile-url">Profile URL</label>
                  <input type="text" id="facebook-profile-url" class="form-control" placeholder="https://facebook.com/yourusername">
                </div>
                
                <div class="form-group">
                  <label for="facebook-display-name">Display Name</label>
                  <input type="text" id="facebook-display-name" class="form-control" placeholder="Your Facebook Name">
                </div>
                
                <div class="form-group">
                  <label class="toggle-switch-label">
                    <input type="checkbox" id="facebook-visible" checked>
                    <span class="toggle-slider-text">Show Facebook in Social Hub</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Instagram Settings -->
            <div class="platform-content instagram" id="instagram-settings">
              <div class="field-group">
                <div class="field-group-title">Instagram Profile</div>
                
                <div class="form-group">
                  <label for="instagram-profile-url">Profile URL</label>
                  <input type="text" id="instagram-profile-url" class="form-control" placeholder="https://instagram.com/yourusername">
                </div>
                
                <div class="form-group">
                  <label for="instagram-display-name">Display Name</label>
                  <input type="text" id="instagram-display-name" class="form-control" placeholder="Your Instagram Name">
                </div>
                
                <div class="form-group">
                  <label class="toggle-switch-label">
                    <input type="checkbox" id="instagram-visible" checked>
                    <span class="toggle-slider-text">Show Instagram in Social Hub</span>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="btn-row">
              <span id="save-platforms-indicator" class="save-indicator">✓ Changes saved</span>
              <button id="save-platforms-btn" class="btn btn-primary">Save Platform Settings</button>
            </div>
          </div>
        </div>
      </div>
      
      <script src="/js/social-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save featured posts
router.post('/api/social/save-featured', async (req, res) => {
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
    
    // Update the site document with featured posts
    const featuredPosts = req.body.featuredPosts;
    
    // Ensure social object exists
    if (!site.social) {
      site.social = {};
    }
    
    // Update featured posts
    site.social.featuredPosts = featuredPosts;
    
    // Save to database
    await sitesCollection.updateOne({ _id: site._id }, { $set: { social: site.social } });
    
    await client.close();
    
    res.json({ success: true, message: 'Featured posts saved successfully' });
    
  } catch (error) {
    console.error('Error saving featured posts:', error);
    res.status(500).json({ error: 'Failed to save featured posts' });
  }
});

// API endpoint to save social hub settings
router.post('/api/social/save-settings', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { socialSettings } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Update site data with social hub settings
      if (socialSettings) {
        const siteFilter = { userId: clientId };
        const site = await db.collection('sites').findOne(siteFilter);
        
        if (site) {
          // Update existing site with social hub settings
          await db.collection('sites').updateOne(
            siteFilter,
            { 
              $set: {
                'social.title': socialSettings.title,
                'social.description': socialSettings.description,
                'social.visible': socialSettings.visible,
                'social.postsPerPage': socialSettings.postsPerPage,
                updatedAt: new Date()
              }
            }
          );
        } else {
          // Create new site with social hub settings
          await db.collection('sites').insertOne({
            userId: clientId,
            social: {
              title: socialSettings.title,
              description: socialSettings.description,
              visible: socialSettings.visible,
              postsPerPage: socialSettings.postsPerPage
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
    console.error('Error saving social hub settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to save platform settings
router.post('/api/social/save-platforms', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { platformSettings } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Update site data with platform settings
      if (platformSettings) {
        const siteFilter = { userId: clientId };
        const site = await db.collection('sites').findOne(siteFilter);
        
        if (site) {
          // Update existing site with platform settings
          await db.collection('sites').updateOne(
            siteFilter,
            { 
              $set: {
                'social.profiles.twitter.url': platformSettings.twitter.profileUrl,
                'social.profiles.twitter.displayName': platformSettings.twitter.displayName,
                'social.profiles.twitter.visible': platformSettings.twitter.visible,
                
                'social.profiles.linkedin.url': platformSettings.linkedin.profileUrl,
                'social.profiles.linkedin.displayName': platformSettings.linkedin.displayName,
                'social.profiles.linkedin.visible': platformSettings.linkedin.visible,
                
                'social.profiles.facebook.url': platformSettings.facebook.profileUrl,
                'social.profiles.facebook.displayName': platformSettings.facebook.displayName,
                'social.profiles.facebook.visible': platformSettings.facebook.visible,
                
                'social.profiles.instagram.url': platformSettings.instagram.profileUrl,
                'social.profiles.instagram.displayName': platformSettings.instagram.displayName,
                'social.profiles.instagram.visible': platformSettings.instagram.visible,
                
                updatedAt: new Date()
              }
            }
          );
        } else {
          // Create new site with platform settings
          await db.collection('sites').insertOne({
            userId: clientId,
            social: {
              profiles: {
                twitter: {
                  url: platformSettings.twitter.profileUrl,
                  displayName: platformSettings.twitter.displayName,
                  visible: platformSettings.twitter.visible
                },
                linkedin: {
                  url: platformSettings.linkedin.profileUrl,
                  displayName: platformSettings.linkedin.displayName,
                  visible: platformSettings.linkedin.visible
                },
                facebook: {
                  url: platformSettings.facebook.profileUrl,
                  displayName: platformSettings.facebook.displayName,
                  visible: platformSettings.facebook.visible
                },
                instagram: {
                  url: platformSettings.instagram.profileUrl,
                  displayName: platformSettings.instagram.displayName,
                  visible: platformSettings.instagram.visible
                }
              }
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
    console.error('Error saving platform settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get social posts
router.get('/api/social/posts', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    // Get platform filter
    const platform = req.query.platform;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Build query
      let query = { userId: clientId };
      
      // Add platform filter if provided
      if (platform) {
        query.platform = platform;
      }
      
      // Get posts
      const posts = await db.collection('socialposts')
        .find(query)
        .sort({ updatedAt: -1 })
        .toArray();
      
      res.json(posts);
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error fetching social posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create/update a social post
router.post('/api/social/posts', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { post } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Check if we're updating an existing post or creating a new one
      if (post._id) {
        // Update existing post
        const postId = typeof post._id === 'string' ? new ObjectId(post._id) : post._id;
        
        await db.collection('socialposts').updateOne(
          { _id: postId },
          { 
            $set: {
              platform: post.platform,
              title: post.title,
              content: post.content,
              link: post.link,
              status: post.status,
              updatedAt: new Date()
            }
          }
        );
        
        res.json({ success: true, message: 'Post updated successfully', postId });
      } else {
        // Create new post
        const result = await db.collection('socialposts').insertOne({
          userId: clientId,
          platform: post.platform,
          title: post.title,
          content: post.content,
          link: post.link,
          status: post.status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.json({ success: true, message: 'Post created successfully', postId: result.insertedId });
      }
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error saving social post:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete a social post
router.delete('/api/social/posts/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const postId = req.params.id;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Delete the post
      await db.collection('socialposts').deleteOne({
        _id: new ObjectId(postId),
        userId: clientId
      });
      
      res.json({ success: true, message: 'Post deleted successfully' });
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error deleting social post:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
