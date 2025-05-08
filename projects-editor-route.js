// Projects Page Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create router
const router = express.Router();

// Projects Page Editor Route
router.get('/editor/projects', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the projects page editor
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Projects Page Editor - Self Cast Studios CMS</title>
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
        .project-list { max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px; margin-top: 10px; }
        .project-item { padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
        .project-item:last-child { border-bottom: none; }
        .project-item input[type="checkbox"] { margin-right: 10px; }
        .project-item-title { font-weight: bold; }
        .project-item-meta { font-size: 12px; color: #64748b; margin-top: 5px; }
        .project-actions { display: flex; gap: 10px; margin-top: 20px; }
        .tab-container { border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }
        .tabs { display: flex; gap: 5px; }
        .tab { padding: 10px 15px; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .info-box-title { font-weight: bold; margin-bottom: 8px; color: #1e40af; }
        .info-box-content { color: #334155; }
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
        <h1>Projects Page Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/projects">Projects Page Editor</a>
        </div>
        
        <div class="tab-container">
          <div class="tabs">
            <div class="tab active" data-tab="page-settings">Page Settings</div>
            <div class="tab" data-tab="manage-projects">Manage Projects</div>
          </div>
        </div>
        
        <div id="page-settings" class="tab-content active">
          <!-- Page Header Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Page Header</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="projects-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="info-box">
              <div class="info-box-title">Navigation & Page Title Customization</div>
              <div class="info-box-content">
                You can customize how this page appears in the navigation menu and what title is displayed at the top of the page. 
                For example, you might prefer to call this section "Portfolio", "Gallery", or "Work" instead of "Projects".
              </div>
            </div>
            
            <div class="form-group">
              <label for="projects-title">Page Title</label>
              <input type="text" id="projects-title" class="form-control" placeholder="Our Projects">
              <small class="form-text text-muted">This is the main heading displayed at the top of the page.</small>
            </div>
            
            <div class="form-group">
              <label for="projects-nav-label">Navigation Label</label>
              <input type="text" id="projects-nav-label" class="form-control" placeholder="Projects">
              <small class="form-text text-muted">This is what appears in the website's navigation menu.</small>
            </div>
            
            <div class="form-group">
              <label for="projects-description">Description</label>
              <textarea id="projects-description" class="form-control" placeholder="Explore our latest projects and work..."></textarea>
            </div>
          </div>
          
          <!-- Filter Navigation Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Filter Navigation</h2>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="show-categories" checked>
                Show Category Filters
              </label>
              <small class="form-text text-muted">Enable this to allow visitors to filter projects by category.</small>
            </div>
          </div>
          
          <!-- Projects Grid Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Projects Grid</h2>
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
              <label for="card-style">Project Card Style</label>
              <select id="card-style" class="select-control">
                <option value="standard" selected>Standard</option>
                <option value="minimal">Minimal</option>
                <option value="featured">Featured</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="projects-per-page">Projects Per Page</label>
              <input type="number" id="projects-per-page" class="form-control number-input" min="1" max="20" value="6">
            </div>
          </div>
          
          <!-- Featured Projects Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Featured Projects</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="featured-projects-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="form-group">
              <label for="featured-projects-heading">Section Heading</label>
              <input type="text" id="featured-projects-heading" class="form-control" placeholder="Featured Projects">
            </div>
            
            <div class="form-group">
              <label>Select Featured Projects</label>
              <div id="featured-projects-list" class="project-list">
                <!-- Projects will be populated dynamically -->
                <p>Loading projects...</p>
              </div>
            </div>
          </div>
          
          <!-- Call to Action Section -->
          <div class="section-card">
            <div class="section-header">
              <h2>Call to Action</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="show-cta" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="form-group">
              <label for="cta-heading">CTA Heading</label>
              <input type="text" id="cta-heading" class="form-control" placeholder="Ready to start your project?">
            </div>
            
            <div class="form-group">
              <label for="cta-text">CTA Text</label>
              <textarea id="cta-text" class="form-control" placeholder="Get in touch with us to discuss your project ideas..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="cta-button-text">Button Text</label>
              <input type="text" id="cta-button-text" class="form-control" placeholder="Contact Us">
            </div>
            
            <div class="form-group">
              <label for="cta-button-url">Button URL</label>
              <input type="text" id="cta-button-url" class="form-control" placeholder="/contact">
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
        
        <div id="manage-projects" class="tab-content">
          <!-- Projects Management -->
          <div class="section-card">
            <div class="section-header">
              <h2>Manage Projects</h2>
              <button id="new-project-btn" class="btn btn-primary">Add New Project</button>
            </div>
            
            <div class="form-group">
              <input type="text" id="project-search" class="form-control" placeholder="Search projects...">
            </div>
            
            <div id="projects-list" class="project-list">
              <!-- Projects will be populated dynamically -->
              <p>Loading projects...</p>
            </div>
          </div>
          
          <!-- Project Editor (hidden initially) -->
          <div id="project-editor" class="section-card" style="display: none;">
            <div class="section-header">
              <h2 id="project-editor-title">New Project</h2>
            </div>
            
            <!-- Basic Information -->
            <div class="field-group">
              <div class="field-group-title">Basic Information</div>
              
              <div class="form-group">
                <label for="project-title">Title</label>
                <input type="text" id="project-title" class="form-control" placeholder="Project Title">
              </div>
              
              <div class="form-group admin-only">
                <label for="project-slug">Slug</label>
                <input type="text" id="project-slug" class="form-control" placeholder="project-slug">
                <small class="form-text text-muted">URL-friendly version of the title (admin only)</small>
              </div>
              
              <div class="form-group">
                <label for="project-description">Short Description</label>
                <textarea id="project-description" class="form-control" rows="2" placeholder="Brief description of the project"></textarea>
              </div>
              
              <div class="form-group">
                <label for="project-content">Detailed Content</label>
                <textarea id="project-content" class="form-control" rows="6" placeholder="Detailed information about the project"></textarea>
              </div>
              
              <div class="form-group">
                <label for="project-category">Category</label>
                <input type="text" id="project-category" class="form-control" placeholder="e.g. Web Design, Branding, etc.">
              </div>
            </div>
            
            <!-- Media -->
            <div class="field-group">
              <div class="field-group-title">Media</div>
              
              <div class="form-group">
                <label for="project-featured-image">Featured Image</label>
                <input type="file" id="project-featured-image" accept="image/*">
                <div id="project-image-preview" class="image-preview"></div>
              </div>
            </div>
            
            <!-- Client Information -->
            <div class="field-group">
              <div class="field-group-title">Client Information</div>
              
              <div class="form-group">
                <label for="project-client">Client Name</label>
                <input type="text" id="project-client" class="form-control" placeholder="Client name">
              </div>
              
              <div class="form-group">
                <label for="project-completed-at">Completion Date</label>
                <input type="date" id="project-completed-at" class="form-control">
              </div>
            </div>
            
            <!-- External Links -->
            <div class="field-group">
              <div class="field-group-title">External Links</div>
              
              <div class="form-group">
                <label for="project-url">External URL</label>
                <input type="text" id="project-url" class="form-control" placeholder="https://example.com/project">
                <small class="form-text text-muted">Link to view the project (if applicable)</small>
              </div>
            </div>
            
            <!-- Settings -->
            <div class="field-group">
              <div class="field-group-title">Settings</div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="project-featured">
                  Mark as Featured Project
                </label>
              </div>
            </div>
            
            <div class="project-actions">
              <button id="cancel-project-btn" class="btn btn-secondary">Cancel</button>
              <button id="save-project-btn" class="btn btn-primary">Save Project</button>
              <button id="delete-project-btn" class="btn btn-danger" style="display: none;">Delete Project</button>
            </div>
          </div>
        </div>
      </div>
      
      <script src="/js/projects-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save projects page settings
router.post('/api/projects/save-settings', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { projectsSettings } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Update site data with projects page settings
      if (projectsSettings) {
        const siteFilter = { userId: clientId };
        const site = await db.collection('sites').findOne(siteFilter);
        
        if (site) {
          // Update existing site with projects page settings
          await db.collection('sites').updateOne(
            siteFilter,
            { 
              $set: {
                'projects.title': projectsSettings.title,
                'projects.navLabel': projectsSettings.navLabel,
                'projects.description': projectsSettings.description,
                'projects.visible': projectsSettings.visible,
                'projects.showCategories': projectsSettings.showCategories,
                'projects.gridLayout': projectsSettings.gridLayout,
                'projects.cardStyle': projectsSettings.cardStyle,
                'projects.projectsPerPage': projectsSettings.projectsPerPage,
                'projects.featuredProjects.visible': projectsSettings.featuredProjects.visible,
                'projects.featuredProjects.heading': projectsSettings.featuredProjects.heading,
                'projects.featuredProjects.projectIds': projectsSettings.featuredProjects.projectIds,
                'projects.showCTA': projectsSettings.showCTA,
                'projects.ctaHeading': projectsSettings.ctaHeading,
                'projects.ctaText': projectsSettings.ctaText,
                'projects.ctaButtonText': projectsSettings.ctaButtonText,
                'projects.ctaButtonURL': projectsSettings.ctaButtonURL,
                updatedAt: new Date()
              }
            }
          );
        } else {
          // Create new site with projects page settings
          await db.collection('sites').insertOne({
            userId: clientId,
            projects: {
              title: projectsSettings.title,
              navLabel: projectsSettings.navLabel,
              description: projectsSettings.description,
              visible: projectsSettings.visible,
              showCategories: projectsSettings.showCategories,
              gridLayout: projectsSettings.gridLayout,
              cardStyle: projectsSettings.cardStyle,
              projectsPerPage: projectsSettings.projectsPerPage,
              featuredProjects: {
                visible: projectsSettings.featuredProjects.visible,
                heading: projectsSettings.featuredProjects.heading,
                projectIds: projectsSettings.featuredProjects.projectIds
              },
              showCTA: projectsSettings.showCTA,
              ctaHeading: projectsSettings.ctaHeading,
              ctaText: projectsSettings.ctaText,
              ctaButtonText: projectsSettings.ctaButtonText,
              ctaButtonURL: projectsSettings.ctaButtonURL
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
    console.error('Error saving projects page settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get projects
router.get('/api/projects', async (req, res) => {
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
          { description: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { client: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Get projects
      const projects = await db.collection('projects')
        .find(query)
        .sort({ completedAt: -1 })
        .toArray();
      
      res.json(projects);
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create/update a project
router.post('/api/projects', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const { project } = req.body;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Check if we're updating an existing project or creating a new one
      if (project._id) {
        // Update existing project
        const projectId = typeof project._id === 'string' ? new ObjectId(project._id) : project._id;
        
        await db.collection('projects').updateOne(
          { _id: projectId },
          { 
            $set: {
              title: project.title,
              slug: project.slug,
              description: project.description,
              content: project.content,
              category: project.category,
              featuredImage: project.featuredImage,
              client: project.client,
              completedAt: project.completedAt,
              url: project.url,
              featured: project.featured,
              updatedAt: new Date()
            }
          }
        );
        
        res.json({ success: true, message: 'Project updated successfully', projectId });
      } else {
        // Create new project
        const result = await db.collection('projects').insertOne({
          userId: clientId,
          title: project.title,
          slug: project.slug,
          description: project.description,
          content: project.content,
          category: project.category,
          featuredImage: project.featuredImage,
          client: project.client,
          completedAt: project.completedAt,
          url: project.url,
          featured: project.featured,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        res.json({ success: true, message: 'Project created successfully', projectId: result.insertedId });
      }
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete a project
router.delete('/api/projects/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    const projectId = req.params.id;
    
    // Get client ID (if admin has selected one, otherwise use the current user's ID)
    const clientId = req.user.role === 'admin' && req.query.clientId ? 
      req.query.clientId : req.user.id;
    
    let client;
    try {
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();
      
      // Delete the project
      await db.collection('projects').deleteOne({
        _id: new ObjectId(projectId),
        userId: clientId
      });
      
      res.json({ success: true, message: 'Project deleted successfully' });
    } finally {
      if (client) await client.close();
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
