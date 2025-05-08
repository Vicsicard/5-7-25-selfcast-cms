// Blog Page Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create router
const router = express.Router();

// Blog Page Editor Route
router.get('/editor/blog', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the blog page editor
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blog Page Editor - Self Cast Studios CMS</title>
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
        .radio-group { display: flex; gap: 15px; margin-top: 5px; }
        .radio-group label { display: flex; align-items: center; font-weight: normal; cursor: pointer; }
        .radio-group input { width: auto; margin-right: 5px; }
        .select-control { padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 16px; width: 100%; }
        .number-input { width: 100px; }
        .post-list { max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-top: 10px; }
        .post-item { padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
        .post-item:last-child { border-bottom: none; }
        .post-item input[type="radio"] { margin-right: 10px; }
        .post-item-title { font-weight: bold; }
        .post-item-meta { font-size: 12px; color: #64748b; margin-top: 5px; }
        .post-actions { display: flex; gap: 10px; margin-top: 20px; }
        .tab-container { border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }
        .tabs { display: flex; gap: 5px; }
        .tab { padding: 10px 15px; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        /* Admin-only fields */
        .admin-only { display: none; }
        body.is-admin .admin-only { display: block; }
        
        /* Field groups */
        .field-group { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .field-group-title { font-weight: bold; margin-bottom: 15px; color: #64748b; }
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
        <h1>Blog Page Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/blog">Blog Page Editor</a>
        </div>
        
        <div class="tab-container">
          <div class="tabs">
            <div class="tab active" data-tab="page-settings">Page Settings</div>
            <div class="tab" data-tab="blog-posts">Manage Blog Posts</div>
          </div>
        </div>
        
        <div id="page-settings" class="tab-content active">
          <!-- Page Header Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Page Header</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="blog-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label for="blog-title">Title</label>
              <input type="text" id="blog-title" class="form-control" placeholder="Blog">
            </div>
            <div class="form-group">
              <label for="blog-description">Description</label>
              <textarea id="blog-description" class="form-control" placeholder="Latest news and updates from Self Cast Studios"></textarea>
            </div>
          </div>
          
          <!-- Featured Post Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Featured Post Section</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="featured-post-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="form-group">
              <label>Selection Type</label>
              <div class="radio-group">
                <label>
                  <input type="radio" name="selection-type" value="recent" checked>
                  Most Recent Post
                </label>
                <label>
                  <input type="radio" name="selection-type" value="manual">
                  Manual Selection
                </label>
              </div>
            </div>
            <div class="form-group" id="manual-selection-container" style="display: none;">
              <label for="featured-post-select">Select Featured Post</label>
              <select id="featured-post-select" class="select-control">
                <option value="">-- Select a post --</option>
                <!-- Posts will be populated dynamically -->
              </select>
            </div>
          </div>
          
          <!-- Blog List Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Blog List Section</h2>
            </div>
            <div class="form-group">
              <label for="posts-per-page">Posts Per Page</label>
              <input type="number" id="posts-per-page" class="form-control number-input" min="1" max="20" value="6">
            </div>
            <div class="form-group">
              <label for="grid-layout">Grid Layout</label>
              <select id="grid-layout" class="select-control">
                <option value="grid-2">2 Columns</option>
                <option value="grid-3" selected>3 Columns</option>
                <option value="list">List View</option>
              </select>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="show-categories" checked>
                Show Categories Filter
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="show-search" checked>
                Show Search Functionality
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="show-pagination" checked>
                Show Pagination Controls
              </label>
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
        
        <div id="blog-posts" class="tab-content">
          <!-- Blog Posts Management -->
          <div class="section-card">
            <div class="section-header">
              <h2>Manage Blog Posts</h2>
              <button id="new-post-btn" class="btn btn-primary">Add New Post</button>
            </div>
            
            <div class="form-group">
              <input type="text" id="post-search" class="form-control" placeholder="Search posts...">
            </div>
            
            <div id="posts-list" class="post-list">
              <!-- Posts will be populated dynamically -->
              <p>Loading blog posts...</p>
            </div>
          </div>
          
          <!-- Post Editor (hidden initially) -->
          <div id="post-editor" class="section-card" style="display: none;">
            <div class="section-header">
              <h2 id="post-editor-title">New Blog Post</h2>
            </div>
            
            <!-- Essential Fields (visible to all users) -->
            <div class="field-group">
              <div class="field-group-title">Basic Information</div>
              
              <div class="form-group">
                <label for="post-title">Title</label>
                <input type="text" id="post-title" class="form-control" placeholder="Post Title">
              </div>
              
              <div class="form-group admin-only">
                <label for="post-slug">Slug</label>
                <input type="text" id="post-slug" class="form-control" placeholder="post-slug">
                <small class="form-text text-muted">URL-friendly version of the title (admin only)</small>
              </div>
              
              <div class="form-group">
                <label for="post-content">Content</label>
                <textarea id="post-content" class="form-control" rows="10" placeholder="Write your post content here..."></textarea>
              </div>
              
              <div class="form-group admin-only">
                <label for="post-category">Category</label>
                <input type="text" id="post-category" class="form-control" placeholder="e.g. News, Tutorial, etc.">
              </div>
            </div>
            
            <!-- Media Section -->
            <div class="field-group">
              <div class="field-group-title">Media</div>
              
              <div class="form-group">
                <label for="post-featured-image">Featured Image</label>
                <input type="file" id="post-featured-image" accept="image/*">
                <div id="post-image-preview" class="image-preview"></div>
              </div>
            </div>
            
            <!-- Author Section -->
            <div class="field-group">
              <div class="field-group-title">Author Information</div>
              
              <div class="form-group">
                <label for="post-author-name">Author Name</label>
                <input type="text" id="post-author-name" class="form-control" placeholder="Author name">
              </div>
              
              <div class="form-group admin-only">
                <label for="post-author-title">Author Title</label>
                <input type="text" id="post-author-title" class="form-control" placeholder="Author title or role">
              </div>
              
              <div class="form-group admin-only">
                <label for="post-author-bio">Author Bio</label>
                <textarea id="post-author-bio" class="form-control" rows="3" placeholder="Brief author biography"></textarea>
              </div>
            </div>
            
            <!-- Publication Settings -->
            <div class="field-group">
              <div class="field-group-title">Publication Settings</div>
              
              <div class="form-group">
                <label for="post-published-date">Published Date</label>
                <input type="date" id="post-published-date" class="form-control">
              </div>
              
              <div class="form-group admin-only">
                <label for="post-status">Status</label>
                <select id="post-status" class="select-control">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="post-featured">
                  Mark as Featured Post
                </label>
              </div>
            </div>
            
            <!-- SEO Settings (Admin Only) -->
            <div class="field-group admin-only">
              <div class="field-group-title">SEO Settings (Admin Only)</div>
              
              <div class="form-group">
                <label for="post-meta-title">Meta Title</label>
                <input type="text" id="post-meta-title" class="form-control" placeholder="Meta title for SEO">
              </div>
              
              <div class="form-group">
                <label for="post-meta-description">Meta Description</label>
                <textarea id="post-meta-description" class="form-control" rows="2" placeholder="Meta description for SEO"></textarea>
              </div>
              
              <div class="form-group">
                <label for="post-tags">Tags</label>
                <input type="text" id="post-tags" class="form-control" placeholder="Comma-separated tags">
              </div>
            </div>
            
            <div class="post-actions">
              <button id="cancel-post-btn" class="btn btn-secondary">Cancel</button>
              <button id="save-post-btn" class="btn btn-primary">Save Post</button>
              <button id="delete-post-btn" class="btn btn-danger" style="display: none;">Delete Post</button>
            </div>
          </div>
        </div>
      </div>
      
      <script src="/js/blog-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save blog page settings
router.post('/api/blog/save-settings', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { blogSettings } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Update site data with blog page settings
      if (blogSettings) {
        const siteFilter = { userId: clientId };
        const site = await db.collection('sites').findOne(siteFilter);
        
        if (site) {
          // Update existing site with blog page settings
          await db.collection('sites').updateOne(
            siteFilter,
            { 
              $set: {
                'blog.title': blogSettings.title,
                'blog.description': blogSettings.description,
                'blog.visible': blogSettings.visible,
                'blog.featuredPost.visible': blogSettings.featuredPost.visible,
                'blog.featuredPost.selectionType': blogSettings.featuredPost.selectionType,
                'blog.featuredPost.postId': blogSettings.featuredPost.postId,
                'blog.postsPerPage': blogSettings.postsPerPage,
                'blog.gridLayout': blogSettings.gridLayout,
                'blog.showCategories': blogSettings.showCategories,
                'blog.showSearch': blogSettings.showSearch,
                'blog.showPagination': blogSettings.showPagination,
                updatedAt: new Date()
              }
            }
          );
        } else {
          // Create new site with blog page settings
          await db.collection('sites').insertOne({
            userId: clientId,
            blog: {
              title: blogSettings.title,
              description: blogSettings.description,
              visible: blogSettings.visible,
              featuredPost: {
                visible: blogSettings.featuredPost.visible,
                selectionType: blogSettings.featuredPost.selectionType,
                postId: blogSettings.featuredPost.postId
              },
              postsPerPage: blogSettings.postsPerPage,
              gridLayout: blogSettings.gridLayout,
              showCategories: blogSettings.showCategories,
              showSearch: blogSettings.showSearch,
              showPagination: blogSettings.showPagination
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
    console.error('Error saving blog page settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get blog posts
router.get('/api/blog/posts', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Query parameters
      const search = req.query.search || '';
      
      // Build query
      let query = { userId: clientId };
      
      // Add search if provided
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Get posts
      const posts = await db.collection('blogposts')
        .find(query)
        .sort({ publishedDate: -1 })
        .toArray();
      
      res.json(posts);
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create/update a blog post
router.post('/api/blog/posts', async (req, res) => {
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
        
        await db.collection('blogposts').updateOne(
          { _id: postId },
          { 
            $set: {
              title: post.title,
              slug: post.slug,
              content: post.content,
              category: post.category,
              featuredImage: post.featuredImage,
              status: post.status,
              featured: post.featured,
              author: {
                id: post.author?.id || req.user.id,
                name: post.author?.name || req.user.name || req.user.email,
                title: post.author?.title || '',
                bio: post.author?.bio || '',
                email: post.author?.email || req.user.email
              },
              publishedDate: post.publishedDate || (post.status === 'published' ? new Date() : null),
              meta: {
                title: post.meta?.title || post.title,
                description: post.meta?.description || ''
              },
              tags: post.tags || [],
              updatedAt: new Date()
            }
          }
        );
        
        res.json({ success: true, message: 'Post updated successfully', postId });
      } else {
        // Create new post
        const result = await db.collection('blogposts').insertOne({
          userId: clientId,
          title: post.title,
          slug: post.slug,
          content: post.content,
          category: post.category,
          featuredImage: post.featuredImage,
          status: post.status,
          featured: post.featured,
          author: {
            id: req.user.id,
            name: post.author?.name || req.user.name || req.user.email,
            title: post.author?.title || '',
            bio: post.author?.bio || '',
            email: req.user.email
          },
          publishedDate: post.publishedDate || (post.status === 'published' ? new Date() : null),
          meta: {
            title: post.meta?.title || post.title,
            description: post.meta?.description || ''
          },
          tags: post.tags || [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.json({ success: true, message: 'Post created successfully', postId: result.insertedId });
      }
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error saving blog post:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete a blog post
router.delete('/api/blog/posts/:id', async (req, res) => {
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
      await db.collection('blogposts').deleteOne({
        _id: new ObjectId(postId),
        userId: clientId
      });
      
      res.json({ success: true, message: 'Post deleted successfully' });
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
