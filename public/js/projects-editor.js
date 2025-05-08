// Projects Page Editor JavaScript
// Global variables
let selectedClientId = null;
let isAdmin = false;

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is admin
  isAdmin = document.body.classList.contains('is-admin');
  console.log('User is admin:', isAdmin);
  
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
  selectedClientId = localStorage.getItem('selectedClientId');
  
  // Tab switching functionality
  setupTabs();
  
  // Load projects page settings
  loadProjectsPageSettings();
  
  // Load projects for featured projects selection
  loadProjects();
  
  // Setup image preview for project featured image
  setupImagePreview('project-featured-image', 'project-image-preview');
  
  // Save settings button click handler
  document.getElementById('save-btn').addEventListener('click', saveProjectsPageSettings);
  
  // Preview button click handler
  document.getElementById('preview-btn').addEventListener('click', () => {
    alert('Preview functionality will be implemented in the next phase.');
  });
  
  // Publish button click handler
  document.getElementById('publish-btn').addEventListener('click', () => {
    alert('Publish functionality will be implemented in the next phase.');
  });
  
  // New project button click handler
  document.getElementById('new-project-btn').addEventListener('click', showNewProjectEditor);
  
  // Cancel project button click handler
  document.getElementById('cancel-project-btn').addEventListener('click', hideProjectEditor);
  
  // Save project button click handler
  document.getElementById('save-project-btn').addEventListener('click', saveProject);
  
  // Delete project button click handler
  document.getElementById('delete-project-btn').addEventListener('click', deleteProject);
  
  // Project search functionality
  document.getElementById('project-search').addEventListener('input', debounce(function() {
    loadProjects(this.value);
  }, 300));
  
  // Auto-generate slug from title
  document.getElementById('project-title').addEventListener('input', function() {
    if (!currentProjectId) { // Only auto-generate for new projects
      const slug = this.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      
      document.getElementById('project-slug').value = slug;
    }
  });
});

// Current project being edited
let currentProjectId = null;

// Setup tab switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Load projects page settings from the server
async function loadProjectsPageSettings() {
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
    
    if (site && site.projects) {
      // Populate page header
      document.getElementById('projects-title').value = site.projects.title || 'Our Projects';
      document.getElementById('projects-nav-label').value = site.projects.navLabel || 'Projects';
      document.getElementById('projects-description').value = site.projects.description || '';
      document.getElementById('projects-visible').checked = site.projects.visible !== false;
      
      // Populate filter navigation
      document.getElementById('show-categories').checked = site.projects.showCategories !== false;
      
      // Populate projects grid
      document.getElementById('grid-layout').value = site.projects.gridLayout || 'grid-3';
      document.getElementById('card-style').value = site.projects.cardStyle || 'standard';
      document.getElementById('projects-per-page').value = site.projects.projectsPerPage || 6;
      
      // Populate featured projects
      document.getElementById('featured-projects-visible').checked = 
        site.projects.featuredProjects && site.projects.featuredProjects.visible !== false;
      document.getElementById('featured-projects-heading').value = 
        site.projects.featuredProjects && site.projects.featuredProjects.heading || 'Featured Projects';
      
      // Populate call to action
      document.getElementById('show-cta').checked = site.projects.showCTA !== false;
      document.getElementById('cta-heading').value = site.projects.ctaHeading || 'Ready to start your project?';
      document.getElementById('cta-text').value = site.projects.ctaText || '';
      document.getElementById('cta-button-text').value = site.projects.ctaButtonText || 'Contact Us';
      document.getElementById('cta-button-url').value = site.projects.ctaButtonURL || '/contact';
      
      // Load featured projects selection
      if (site.projects.featuredProjects && site.projects.featuredProjects.projectIds) {
        loadFeaturedProjectsSelection(site.projects.featuredProjects.projectIds);
      }
    }
  } catch (error) {
    console.error('Error loading projects page settings:', error);
    alert('Failed to load projects page settings. Please try again.');
  }
}

// Load projects for the featured projects selection
async function loadProjects(searchTerm = '') {
  try {
    // Show loading message
    document.getElementById('projects-list').innerHTML = '<p>Loading projects...</p>';
    document.getElementById('featured-projects-list').innerHTML = '<p>Loading projects...</p>';
    
    // Fetch projects
    let projectsUrl = '/api/projects';
    if (searchTerm) {
      projectsUrl += `?search=${encodeURIComponent(searchTerm)}`;
    }
    if (selectedClientId) {
      projectsUrl += projectsUrl.includes('?') ? '&' : '?';
      projectsUrl += 'clientId=' + selectedClientId;
    }
    
    const projectsResponse = await fetch(projectsUrl);
    if (!projectsResponse.ok) throw new Error('Failed to load projects');
    const projects = await projectsResponse.json();
    
    // Display projects in the projects list
    const projectsList = document.getElementById('projects-list');
    
    if (projects.length === 0) {
      projectsList.innerHTML = '<p>No projects found. Click "Add New Project" to create one.</p>';
      document.getElementById('featured-projects-list').innerHTML = '<p>No projects available for featuring. Create projects first.</p>';
      return;
    }
    
    projectsList.innerHTML = '';
    
    projects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      
      const completedDate = project.completedAt ? new Date(project.completedAt).toLocaleDateString() : 'N/A';
      
      projectItem.innerHTML = `
        <div>
          <div class="project-item-title">${project.title}</div>
          <div class="project-item-meta">
            Category: ${project.category || 'Uncategorized'} | Client: ${project.client || 'N/A'} | Completed: ${completedDate}
            ${project.featured ? ' | <strong>Featured</strong>' : ''}
          </div>
        </div>
      `;
      
      projectItem.addEventListener('click', () => {
        editProject(project);
      });
      
      projectsList.appendChild(projectItem);
    });
    
    // Also populate the featured projects selection list
    loadFeaturedProjectsSelection(null, projects);
    
  } catch (error) {
    console.error('Error loading projects:', error);
    document.getElementById('projects-list').innerHTML = '<p>Error loading projects. Please try again.</p>';
    document.getElementById('featured-projects-list').innerHTML = '<p>Error loading projects. Please try again.</p>';
  }
}

// Load featured projects selection
async function loadFeaturedProjectsSelection(selectedProjectIds = null, projectsData = null) {
  try {
    let projects = projectsData;
    
    // If projects data wasn't passed, fetch it
    if (!projects) {
      let projectsUrl = '/api/projects';
      if (selectedClientId) {
        projectsUrl += '?clientId=' + selectedClientId;
      }
      
      const projectsResponse = await fetch(projectsUrl);
      if (!projectsResponse.ok) throw new Error('Failed to load projects');
      projects = await projectsResponse.json();
    }
    
    // Display projects in the featured projects list
    const featuredProjectsList = document.getElementById('featured-projects-list');
    
    if (projects.length === 0) {
      featuredProjectsList.innerHTML = '<p>No projects available for featuring. Create projects first.</p>';
      return;
    }
    
    featuredProjectsList.innerHTML = '';
    
    projects.forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      
      const isSelected = selectedProjectIds && selectedProjectIds.includes(project._id);
      
      projectItem.innerHTML = `
        <label>
          <input type="checkbox" name="featured-project" value="${project._id}" ${isSelected ? 'checked' : ''}>
          <div>
            <div class="project-item-title">${project.title}</div>
            <div class="project-item-meta">
              Category: ${project.category || 'Uncategorized'} | Client: ${project.client || 'N/A'}
            </div>
          </div>
        </label>
      `;
      
      featuredProjectsList.appendChild(projectItem);
    });
    
  } catch (error) {
    console.error('Error loading featured projects selection:', error);
    document.getElementById('featured-projects-list').innerHTML = '<p>Error loading projects. Please try again.</p>';
  }
}

// Save projects page settings
async function saveProjectsPageSettings() {
  try {
    // Get selected featured projects
    const featuredProjectsCheckboxes = document.querySelectorAll('input[name="featured-project"]:checked');
    const featuredProjectIds = Array.from(featuredProjectsCheckboxes).map(checkbox => checkbox.value);
    
    // Collect data from form
    const projectsSettings = {
      title: document.getElementById('projects-title').value,
      navLabel: document.getElementById('projects-nav-label').value,
      description: document.getElementById('projects-description').value,
      visible: document.getElementById('projects-visible').checked,
      showCategories: document.getElementById('show-categories').checked,
      gridLayout: document.getElementById('grid-layout').value,
      cardStyle: document.getElementById('card-style').value,
      projectsPerPage: parseInt(document.getElementById('projects-per-page').value),
      featuredProjects: {
        visible: document.getElementById('featured-projects-visible').checked,
        heading: document.getElementById('featured-projects-heading').value,
        projectIds: featuredProjectIds
      },
      showCTA: document.getElementById('show-cta').checked,
      ctaHeading: document.getElementById('cta-heading').value,
      ctaText: document.getElementById('cta-text').value,
      ctaButtonText: document.getElementById('cta-button-text').value,
      ctaButtonURL: document.getElementById('cta-button-url').value
    };
    
    // Build the request URL
    let saveUrl = '/api/projects/save-settings';
    if (selectedClientId) {
      saveUrl += '?clientId=' + selectedClientId;
    }
    
    // Send data to server
    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectsSettings
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save changes');
    }
    
    // Show success message
    const saveIndicator = document.getElementById('save-indicator');
    saveIndicator.style.display = 'inline';
    
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 3000);
    
    alert('Projects page settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving projects page settings:', error);
    alert('Failed to save projects page settings: ' + error.message);
  }
}

// Show new project editor
function showNewProjectEditor() {
  // Reset current project ID
  currentProjectId = null;
  
  // Reset form fields
  document.getElementById('project-editor-title').textContent = 'New Project';
  document.getElementById('project-title').value = '';
  document.getElementById('project-slug').value = '';
  document.getElementById('project-description').value = '';
  document.getElementById('project-content').value = '';
  document.getElementById('project-category').value = '';
  document.getElementById('project-image-preview').innerHTML = '';
  document.getElementById('project-client').value = '';
  document.getElementById('project-completed-at').value = '';
  document.getElementById('project-url').value = '';
  document.getElementById('project-featured').checked = false;
  
  // Hide delete button
  document.getElementById('delete-project-btn').style.display = 'none';
  
  // Show project editor
  document.getElementById('project-editor').style.display = 'block';
  
  // Scroll to editor
  document.getElementById('project-editor').scrollIntoView({ behavior: 'smooth' });
}

// Hide project editor
function hideProjectEditor() {
  document.getElementById('project-editor').style.display = 'none';
}

// Edit existing project
function editProject(project) {
  // Set current project ID
  currentProjectId = project._id;
  
  // Fill form fields
  document.getElementById('project-editor-title').textContent = 'Edit Project';
  document.getElementById('project-title').value = project.title || '';
  document.getElementById('project-slug').value = project.slug || '';
  document.getElementById('project-description').value = project.description || '';
  document.getElementById('project-content').value = project.content || '';
  document.getElementById('project-category').value = project.category || '';
  document.getElementById('project-client').value = project.client || '';
  document.getElementById('project-featured').checked = project.featured || false;
  
  // Fill completion date
  if (project.completedAt) {
    const completedDate = new Date(project.completedAt);
    const formattedDate = completedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    document.getElementById('project-completed-at').value = formattedDate;
  } else {
    document.getElementById('project-completed-at').value = '';
  }
  
  // Fill external URL
  document.getElementById('project-url').value = project.url || '';
  
  // Show featured image if available
  if (project.featuredImage) {
    document.getElementById('project-image-preview').innerHTML = 
      `<img src="${project.featuredImage}" alt="Featured Image" class="image-preview">`;
  } else {
    document.getElementById('project-image-preview').innerHTML = '';
  }
  
  // Show delete button
  document.getElementById('delete-project-btn').style.display = 'inline-block';
  
  // Show project editor
  document.getElementById('project-editor').style.display = 'block';
  
  // Scroll to editor
  document.getElementById('project-editor').scrollIntoView({ behavior: 'smooth' });
}

// Save project
async function saveProject() {
  try {
    // Validate required fields
    const title = document.getElementById('project-title').value;
    let slug = document.getElementById('project-slug').value;
    
    if (!title) {
      alert('Please enter a project title');
      return;
    }
    
    // For non-admin users, auto-generate slug if not provided
    if (!isAdmin || !slug) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      
      // Update the slug field for admins
      if (isAdmin) {
        document.getElementById('project-slug').value = slug;
      }
    }
    
    // Get completion date value
    const completedDateInput = document.getElementById('project-completed-at').value;
    let completedAt = null;
    if (completedDateInput) {
      completedAt = new Date(completedDateInput);
    }
    
    // Collect data from form
    const project = {
      _id: currentProjectId, // Will be null for new projects
      title: title,
      slug: slug,
      description: document.getElementById('project-description').value,
      content: document.getElementById('project-content').value,
      category: document.getElementById('project-category').value,
      client: document.getElementById('project-client').value,
      completedAt: completedAt,
      url: document.getElementById('project-url').value,
      featured: document.getElementById('project-featured').checked
    };
    
    // Get featured image if available
    const imagePreview = document.querySelector('#project-image-preview img');
    if (imagePreview) {
      project.featuredImage = imagePreview.src;
    }
    
    // Build the request URL
    let saveUrl = '/api/projects';
    if (selectedClientId) {
      saveUrl += '?clientId=' + selectedClientId;
    }
    
    // Send data to server
    const response = await fetch(saveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save project');
    }
    
    const result = await response.json();
    
    // Update current project ID if this was a new project
    if (!currentProjectId && result.projectId) {
      currentProjectId = result.projectId;
    }
    
    // Show success message
    alert(result.message || 'Project saved successfully!');
    
    // Reload projects
    loadProjects();
    
    // Hide project editor
    hideProjectEditor();
    
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Failed to save project: ' + error.message);
  }
}

// Delete project
async function deleteProject() {
  try {
    if (!currentProjectId) {
      alert('No project selected for deletion');
      return;
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    
    // Build the request URL
    let deleteUrl = `/api/projects/${currentProjectId}`;
    if (selectedClientId) {
      deleteUrl += '?clientId=' + selectedClientId;
    }
    
    // Send delete request
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete project');
    }
    
    // Show success message
    alert('Project deleted successfully!');
    
    // Reload projects
    loadProjects();
    
    // Hide project editor
    hideProjectEditor();
    
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Failed to delete project: ' + error.message);
  }
}

// Image preview functionality
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        preview.innerHTML = `<img src="${event.target.result}" alt="Preview" class="image-preview">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
