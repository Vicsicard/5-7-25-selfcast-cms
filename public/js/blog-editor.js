// Blog Page Editor JavaScript
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
  
  // Load blog page settings
  loadBlogPageSettings();
  
  // Load blog posts
  loadBlogPosts();
  
  // Setup featured post selection type toggle
  document.querySelectorAll('input[name="selection-type"]').forEach(radio => {
    radio.addEventListener('change', toggleManualSelection);
  });
  
  // Setup image preview for post featured image
  setupImagePreview('post-featured-image', 'post-image-preview');
  
  // Save settings button click handler
  document.getElementById('save-btn').addEventListener('click', saveBlogPageSettings);
  
  // Preview button click handler
  document.getElementById('preview-btn').addEventListener('click', () => {
    alert('Preview functionality will be implemented in the next phase.');
  });
  
  // Publish button click handler
  document.getElementById('publish-btn').addEventListener('click', () => {
    alert('Publish functionality will be implemented in the next phase.');
  });
  
  // New post button click handler
  document.getElementById('new-post-btn').addEventListener('click', showNewPostEditor);
  
  // Cancel post button click handler
  document.getElementById('cancel-post-btn').addEventListener('click', hidePostEditor);
  
  // Save post button click handler
  document.getElementById('save-post-btn').addEventListener('click', savePost);
  
  // Delete post button click handler
  document.getElementById('delete-post-btn').addEventListener('click', deletePost);
  
  // Post search functionality
  document.getElementById('post-search').addEventListener('input', debounce(function() {
    loadBlogPosts(this.value);
  }, 300));
  
  // Auto-generate slug from title
  document.getElementById('post-title').addEventListener('input', function() {
    if (!currentPostId) { // Only auto-generate for new posts
      const slug = this.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      
      document.getElementById('post-slug').value = slug;
    }
  });
});

// Current post being edited
let currentPostId = null;

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

// Toggle manual selection container based on selection type
function toggleManualSelection() {
  const selectionType = document.querySelector('input[name="selection-type"]:checked').value;
  const manualSelectionContainer = document.getElementById('manual-selection-container');
  
  if (selectionType === 'manual') {
    manualSelectionContainer.style.display = 'block';
  } else {
    manualSelectionContainer.style.display = 'none';
  }
}

// Load blog page settings from the server
async function loadBlogPageSettings() {
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
    
    if (site && site.blog) {
      // Populate page header
      document.getElementById('blog-title').value = site.blog.title || 'Blog';
      document.getElementById('blog-description').value = site.blog.description || '';
      document.getElementById('blog-visible').checked = site.blog.visible !== false;
      
      // Populate featured post section
      document.getElementById('featured-post-visible').checked = 
        site.blog.featuredPost && site.blog.featuredPost.visible !== false;
      
      const selectionType = site.blog.featuredPost && site.blog.featuredPost.selectionType || 'recent';
      document.querySelector(`input[name="selection-type"][value="${selectionType}"]`).checked = true;
      toggleManualSelection();
      
      if (site.blog.featuredPost && site.blog.featuredPost.postId) {
        document.getElementById('featured-post-select').value = site.blog.featuredPost.postId;
      }
      
      // Populate blog list section
      document.getElementById('posts-per-page').value = site.blog.postsPerPage || 6;
      document.getElementById('grid-layout').value = site.blog.gridLayout || 'grid-3';
      document.getElementById('show-categories').checked = site.blog.showCategories !== false;
      document.getElementById('show-search').checked = site.blog.showSearch !== false;
      document.getElementById('show-pagination').checked = site.blog.showPagination !== false;
    }
    
    // Load posts for featured post selection
    await loadPostsForSelection();
    
  } catch (error) {
    console.error('Error loading blog page settings:', error);
    alert('Failed to load blog page settings. Please try again.');
  }
}

// Load posts for the featured post selection dropdown
async function loadPostsForSelection() {
  try {
    // Fetch published posts
    let postsUrl = '/api/blog/posts?status=published';
    if (selectedClientId) {
      postsUrl += '&clientId=' + selectedClientId;
    }
    
    const postsResponse = await fetch(postsUrl);
    if (!postsResponse.ok) throw new Error('Failed to load posts');
    const posts = await postsResponse.json();
    
    // Populate the featured post selection dropdown
    const select = document.getElementById('featured-post-select');
    select.innerHTML = '<option value="">-- Select a post --</option>';
    
    posts.forEach(post => {
      const option = document.createElement('option');
      option.value = post._id;
      option.textContent = post.title;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('Error loading posts for selection:', error);
  }
}

// Load blog posts
async function loadBlogPosts(searchTerm = '') {
  try {
    // Show loading message
    document.getElementById('posts-list').innerHTML = '<p>Loading blog posts...</p>';
    
    // Fetch posts
    let postsUrl = '/api/blog/posts';
    if (searchTerm) {
      postsUrl += `?search=${encodeURIComponent(searchTerm)}`;
    }
    if (selectedClientId) {
      postsUrl += postsUrl.includes('?') ? '&' : '?';
      postsUrl += 'clientId=' + selectedClientId;
    }
    
    const postsResponse = await fetch(postsUrl);
    if (!postsResponse.ok) throw new Error('Failed to load posts');
    const posts = await postsResponse.json();
    
    // Display posts
    const postsList = document.getElementById('posts-list');
    
    if (posts.length === 0) {
      postsList.innerHTML = '<p>No posts found. Click "Add New Post" to create one.</p>';
      return;
    }
    
    postsList.innerHTML = '';
    
    posts.forEach(post => {
      const postItem = document.createElement('div');
      postItem.className = 'post-item';
      
      const publishedDate = post.publishedDate ? new Date(post.publishedDate).toLocaleDateString() : 'Draft';
      const status = post.status === 'published' ? 'Published' : 'Draft';
      
      postItem.innerHTML = `
        <div>
          <div class="post-item-title">${post.title}</div>
          <div class="post-item-meta">
            ${status} | ${publishedDate} | Category: ${post.category || 'Uncategorized'}
            ${post.featured ? ' | <strong>Featured</strong>' : ''}
          </div>
        </div>
      `;
      
      postItem.addEventListener('click', () => {
        editPost(post);
      });
      
      postsList.appendChild(postItem);
    });
    
  } catch (error) {
    console.error('Error loading blog posts:', error);
    document.getElementById('posts-list').innerHTML = '<p>Error loading posts. Please try again.</p>';
  }
}

// Save blog page settings
async function saveBlogPageSettings() {
  try {
    // Collect data from form
    const blogSettings = {
      title: document.getElementById('blog-title').value,
      description: document.getElementById('blog-description').value,
      visible: document.getElementById('blog-visible').checked,
      featuredPost: {
        visible: document.getElementById('featured-post-visible').checked,
        selectionType: document.querySelector('input[name="selection-type"]:checked').value,
        postId: document.getElementById('featured-post-select').value
      },
      postsPerPage: parseInt(document.getElementById('posts-per-page').value),
      gridLayout: document.getElementById('grid-layout').value,
      showCategories: document.getElementById('show-categories').checked,
      showSearch: document.getElementById('show-search').checked,
      showPagination: document.getElementById('show-pagination').checked
    };
    
    // Build the request URL
    let saveUrl = '/api/blog/save-settings';
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
        blogSettings
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
    
    alert('Blog page settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving blog page settings:', error);
    alert('Failed to save blog page settings: ' + error.message);
  }
}

// Show new post editor
function showNewPostEditor() {
  // Reset current post ID
  currentPostId = null;
  
  // Reset form fields
  document.getElementById('post-editor-title').textContent = 'New Blog Post';
  document.getElementById('post-title').value = '';
  document.getElementById('post-slug').value = '';
  document.getElementById('post-content').value = '';
  document.getElementById('post-category').value = '';
  document.getElementById('post-image-preview').innerHTML = '';
  document.getElementById('post-status').value = 'draft';
  document.getElementById('post-featured').checked = false;
  
  // Reset author fields
  document.getElementById('post-author-name').value = '';
  document.getElementById('post-author-title').value = '';
  document.getElementById('post-author-bio').value = '';
  
  // Reset published date
  document.getElementById('post-published-date').value = '';
  
  // Reset SEO fields
  document.getElementById('post-meta-title').value = '';
  document.getElementById('post-meta-description').value = '';
  
  // Reset tags
  document.getElementById('post-tags').value = '';
  
  // Hide delete button
  document.getElementById('delete-post-btn').style.display = 'none';
  
  // Show post editor
  document.getElementById('post-editor').style.display = 'block';
  
  // Scroll to editor
  document.getElementById('post-editor').scrollIntoView({ behavior: 'smooth' });
}

// Hide post editor
function hidePostEditor() {
  document.getElementById('post-editor').style.display = 'none';
}

// Edit existing post
function editPost(post) {
  // Set current post ID
  currentPostId = post._id;
  
  // Fill form fields
  document.getElementById('post-editor-title').textContent = 'Edit Blog Post';
  document.getElementById('post-title').value = post.title || '';
  document.getElementById('post-slug').value = post.slug || '';
  document.getElementById('post-content').value = post.content || '';
  document.getElementById('post-category').value = post.category || '';
  document.getElementById('post-status').value = post.status || 'draft';
  document.getElementById('post-featured').checked = post.featured || false;
  
  // Fill author fields
  if (post.author) {
    document.getElementById('post-author-name').value = post.author.name || '';
    document.getElementById('post-author-title').value = post.author.title || '';
    document.getElementById('post-author-bio').value = post.author.bio || '';
  }
  
  // Fill published date
  if (post.publishedDate) {
    const publishedDate = new Date(post.publishedDate);
    const formattedDate = publishedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    document.getElementById('post-published-date').value = formattedDate;
  } else {
    document.getElementById('post-published-date').value = '';
  }
  
  // Fill SEO fields
  if (post.meta) {
    document.getElementById('post-meta-title').value = post.meta.title || '';
    document.getElementById('post-meta-description').value = post.meta.description || '';
  }
  
  // Fill tags
  if (post.tags && Array.isArray(post.tags)) {
    document.getElementById('post-tags').value = post.tags.join(', ');
  }
  
  // Show featured image if available
  if (post.featuredImage) {
    document.getElementById('post-image-preview').innerHTML = 
      `<img src="${post.featuredImage}" alt="Featured Image" class="image-preview">`;
  } else {
    document.getElementById('post-image-preview').innerHTML = '';
  }
  
  // Show delete button
  document.getElementById('delete-post-btn').style.display = 'inline-block';
  
  // Show post editor
  document.getElementById('post-editor').style.display = 'block';
  
  // Scroll to editor
  document.getElementById('post-editor').scrollIntoView({ behavior: 'smooth' });
}

// Save post
async function savePost() {
  try {
    // Validate required fields
    const title = document.getElementById('post-title').value;
    let slug = document.getElementById('post-slug').value;
    
    if (!title) {
      alert('Please enter a post title');
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
        document.getElementById('post-slug').value = slug;
      }
    }
    
    // Get published date value
    const publishedDateInput = document.getElementById('post-published-date').value;
    let publishedDate = null;
    if (publishedDateInput) {
      publishedDate = new Date(publishedDateInput);
    }
    
    // Parse tags
    const tagsInput = document.getElementById('post-tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Collect data from form
    const post = {
      _id: currentPostId, // Will be null for new posts
      title: title,
      slug: slug,
      content: document.getElementById('post-content').value,
      category: document.getElementById('post-category').value,
      status: document.getElementById('post-status').value,
      featured: document.getElementById('post-featured').checked,
      author: {
        name: document.getElementById('post-author-name').value,
        title: document.getElementById('post-author-title').value,
        bio: document.getElementById('post-author-bio').value
      },
      publishedDate: publishedDate,
      meta: {
        title: document.getElementById('post-meta-title').value,
        description: document.getElementById('post-meta-description').value
      },
      tags: tags,
      updatedAt: new Date()
    };
    
    // Get featured image if available
    const imagePreview = document.querySelector('#post-image-preview img');
    if (imagePreview) {
      post.featuredImage = imagePreview.src;
    }
    
    // Set published date based on status if not already set
    if (post.status === 'published' && !post.publishedDate) {
      post.publishedDate = new Date();
    }
    
    // Build the request URL
    let saveUrl = '/api/blog/posts';
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
        post
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save post');
    }
    
    const result = await response.json();
    
    // Update current post ID if this was a new post
    if (!currentPostId && result.postId) {
      currentPostId = result.postId;
    }
    
    // Show success message
    alert(result.message || 'Post saved successfully!');
    
    // Reload posts
    loadBlogPosts();
    loadPostsForSelection();
    
    // Hide post editor
    hidePostEditor();
    
  } catch (error) {
    console.error('Error saving post:', error);
    alert('Failed to save post: ' + error.message);
  }
}

// Delete post
async function deletePost() {
  try {
    if (!currentPostId) {
      alert('No post selected for deletion');
      return;
    }
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    // Build the request URL
    let deleteUrl = `/api/blog/posts/${currentPostId}`;
    if (selectedClientId) {
      deleteUrl += '?clientId=' + selectedClientId;
    }
    
    // Send delete request
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete post');
    }
    
    // Show success message
    alert('Post deleted successfully!');
    
    // Reload posts
    loadBlogPosts();
    loadPostsForSelection();
    
    // Hide post editor
    hidePostEditor();
    
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post: ' + error.message);
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
