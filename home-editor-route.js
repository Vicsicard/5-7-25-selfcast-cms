// Homepage Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create router
const router = express.Router();

// Homepage Editor Route
router.get('/editor/home', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the homepage editor
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
          <!-- Hero Section -->
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
          
          <!-- About Section -->
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
          
          <!-- Banner Section 1 -->
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
          
          <!-- Banner Section 2 -->
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
          
          <!-- Social Media Section -->
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
          
          <!-- Blog Posts Section -->
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
          
          <!-- Contact Section -->
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
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
      </div>
      
      <script src="/js/home-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save homepage data
router.post('/api/homepage/save', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { siteData, quoteData, selectedSocialPosts, selectedBlogPosts } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Update site data
      if (siteData) {
        const siteFilter = { userId: clientId };
        const site = await db.collection('sites').findOne(siteFilter);
        
        if (site) {
          // Update existing site
          await db.collection('sites').updateOne(
            siteFilter,
            { $set: siteData }
          );
        } else {
          // Create new site
          await db.collection('sites').insertOne({
            ...siteData,
            userId: clientId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      // Update quotes
      if (quoteData && Array.isArray(quoteData)) {
        // Get existing quotes
        const existingQuotes = await db.collection('quotes')
          .find({ userId: clientId })
          .sort({ position: 1 })
          .toArray();
        
        // Update or create quotes
        for (let i = 0; i < quoteData.length; i++) {
          const quoteContent = quoteData[i];
          
          // Skip empty quotes
          if (!quoteContent.content && !quoteContent.author) continue;
          
          if (existingQuotes[i]) {
            // Update existing quote
            await db.collection('quotes').updateOne(
              { _id: existingQuotes[i]._id },
              { 
                $set: {
                  content: quoteContent.content,
                  author: quoteContent.author,
                  updatedAt: new Date()
                }
              }
            );
          } else {
            // Create new quote
            await db.collection('quotes').insertOne({
              content: quoteContent.content,
              author: quoteContent.author,
              position: i,
              userId: clientId,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      }
      
      // Update social posts (mark as featured)
      if (selectedSocialPosts && Array.isArray(selectedSocialPosts)) {
        // First, unmark all as featured
        await db.collection('socialposts').updateMany(
          { userId: clientId },
          { $set: { featured: false } }
        );
        
        // Then mark selected ones as featured
        if (selectedSocialPosts.length > 0) {
          const socialPostIds = selectedSocialPosts.map(id => {
            try {
              return new ObjectId(id);
            } catch (e) {
              return id; // In case it's already an ObjectId
            }
          });
          
          await db.collection('socialposts').updateMany(
            { _id: { $in: socialPostIds } },
            { $set: { featured: true } }
          );
        }
      }
      
      // Update blog posts (mark as featured)
      if (selectedBlogPosts && Array.isArray(selectedBlogPosts)) {
        // First, unmark all as featured
        await db.collection('blogposts').updateMany(
          { userId: clientId },
          { $set: { featured: false } }
        );
        
        // Then mark selected ones as featured
        if (selectedBlogPosts.length > 0) {
          const blogPostIds = selectedBlogPosts.map(id => {
            try {
              return new ObjectId(id);
            } catch (e) {
              return id; // In case it's already an ObjectId
            }
          });
          
          await db.collection('blogposts').updateMany(
            { _id: { $in: blogPostIds } },
            { $set: { featured: true } }
          );
        }
      }
      
      res.json({ success: true });
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error saving homepage data:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
