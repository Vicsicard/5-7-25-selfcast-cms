// Social Media Hub Editor JavaScript
// Global variables
let selectedClientId = null;
let isAdmin = false;
let currentPostId = null;
let currentPlatform = 'twitter';
let featuredPosts = {
  twitter: null,
  linkedin: null,
  facebook: null,
  instagram: null
};

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
  
  // Platform tab switching functionality
  setupPlatformTabs();
  
  // Load social hub settings
  loadSocialHubSettings();
  
  // Load platform settings
  loadPlatformSettings();
  
  // Load featured posts
  loadFeaturedPosts();
  
  // Load social posts for each platform
  loadSocialPosts('twitter');
  loadSocialPosts('linkedin');
  loadSocialPosts('facebook');
  loadSocialPosts('instagram');
  
  // Save general settings button click handler
  const saveGeneralBtn = document.getElementById('save-general-btn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', saveSocialHubSettings);
  }
  
  // Save featured posts button click handler
  const saveFeaturedBtn = document.getElementById('save-featured-btn');
  if (saveFeaturedBtn) {
    saveFeaturedBtn.addEventListener('click', saveFeaturedPosts);
  }
  
  // Save platform settings button click handler
  const savePlatformsBtn = document.getElementById('save-platforms-btn');
  if (savePlatformsBtn) {
    savePlatformsBtn.addEventListener('click', savePlatformSettings);
  }
  
  // Preview button click handler
  const previewBtn = document.getElementById('preview-btn');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      alert('Preview functionality will be implemented in the next phase.');
    });
  }
  
  // Publish button click handler
  const publishBtn = document.getElementById('publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      alert('Publish functionality will be implemented in the next phase.');
    });
  }
  
  // New post button click handler
  const newPostBtn = document.getElementById('new-post-btn');
  if (newPostBtn) {
    newPostBtn.addEventListener('click', showNewPostEditor);
  }
  
  // Cancel post button click handler
  const cancelPostBtn = document.getElementById('cancel-post-btn');
  if (cancelPostBtn) {
    cancelPostBtn.addEventListener('click', hidePostEditor);
  }
  
  // Save post button click handler
  const savePostBtn = document.getElementById('save-post-btn');
  if (savePostBtn) {
    savePostBtn.addEventListener('click', savePost);
  }
  
  // Delete post button click handler
  const deletePostBtn = document.getElementById('delete-post-btn');
  if (deletePostBtn) {
    deletePostBtn.addEventListener('click', deletePost);
  }
  
  // Platform change handler in post editor
  const postPlatform = document.getElementById('post-platform');
  if (postPlatform) {
    postPlatform.addEventListener('change', function() {
      // Update current platform
      currentPlatform = this.value;
    });
  }
});

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

// Setup platform tab switching
function setupPlatformTabs() {
  // For posts
  const postPlatformTabs = document.querySelectorAll('#manage-posts .platform-tab');
  const postPlatformContents = document.querySelectorAll('#manage-posts .platform-content');
  
  postPlatformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      postPlatformTabs.forEach(t => t.classList.remove('active'));
      postPlatformContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const platform = tab.getAttribute('data-platform');
      const platformPostsElement = document.getElementById(`${platform}-posts`);
      if (platformPostsElement) {
        platformPostsElement.classList.add('active');
      }
      
      // Update current platform
      currentPlatform = platform;
    });
  });
  
  // For featured posts - find the section that contains the featured posts
  const featuredPostsSection = document.querySelector('.section-card:nth-child(2)');
  if (featuredPostsSection) {
    const featuredPlatformTabs = featuredPostsSection.querySelectorAll('.platform-tab');
    const featuredPlatformContents = document.querySelectorAll('#twitter-featured, #linkedin-featured, #facebook-featured, #instagram-featured');
    
    featuredPlatformTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        featuredPlatformTabs.forEach(t => t.classList.remove('active'));
        featuredPlatformContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const platform = tab.getAttribute('data-platform');
        const platformFeaturedElement = document.getElementById(`${platform}-featured`);
        if (platformFeaturedElement) {
          platformFeaturedElement.classList.add('active');
        }
      });
    });
  }
  
  // This code block is now inside the if (featuredPostsSection) condition above
  
  // For platform settings
  const settingsPlatformTabs = document.querySelectorAll('#platform-settings .platform-tab');
  const settingsPlatformContents = document.querySelectorAll('#platform-settings .platform-content');
  
  settingsPlatformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      settingsPlatformTabs.forEach(t => t.classList.remove('active'));
      settingsPlatformContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const platform = tab.getAttribute('data-platform');
      const platformSettingsElement = document.getElementById(`${platform}-settings`);
      if (platformSettingsElement) {
        platformSettingsElement.classList.add('active');
      }
    });
  });
}

// Load social hub settings from the server
async function loadSocialHubSettings() {
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
    
    if (site && site.social) {
      // Populate social hub settings
      document.getElementById('social-hub-title').value = site.social.title || 'Social Media Hub';
      document.getElementById('social-hub-description').value = site.social.description || '';
      document.getElementById('social-hub-visible').checked = site.social.visible !== false;
      document.getElementById('posts-per-page').value = site.social.postsPerPage || 6;
    }
  } catch (error) {
    console.error('Error loading social hub settings:', error);
    alert('Failed to load social hub settings. Please try again.');
  }
}

// Load featured posts from the server
async function loadFeaturedPosts() {
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
    
    if (site && site.social && site.social.featuredPosts) {
      // Store featured posts
      featuredPosts = site.social.featuredPosts;
      
      // Update UI to show featured posts
      Object.keys(featuredPosts).forEach(platform => {
        const featuredPostElement = document.getElementById(`${platform}-featured-post`);
        if (!featuredPostElement) return; // Skip if element doesn't exist
        
        if (featuredPosts[platform]) {
          const post = featuredPosts[platform];
          // Make sure post has all required properties before using them
          const title = post.title || 'Untitled Post';
          const content = post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : 'No content';
          const status = post.status || 'draft';
          const updatedDate = post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'N/A';
          
          featuredPostElement.innerHTML = `
            <div class="featured-post-item">
              <div class="featured-post-title">${title}</div>
              <div class="featured-post-content">${content}</div>
              <div class="featured-post-meta">
                Status: ${status} | Updated: ${updatedDate}
              </div>
            </div>
          `;
        } else {
          featuredPostElement.innerHTML = '<p>No featured post selected</p>';
        }
      });
    }
  } catch (error) {
    console.error('Error loading featured posts:', error);
    alert('Failed to load featured posts. Please try again.');
  }
}

// Toggle featured post status
async function toggleFeaturedPost(platform, post) {
  try {
    if (!post || !platform) {
      console.error('Invalid post or platform provided to toggleFeaturedPost');
      return;
    }
    
    // If this post is already featured, unfeatured it
    if (featuredPosts[platform] && featuredPosts[platform]._id === post._id) {
      featuredPosts[platform] = null;
    } else {
      // Otherwise, set it as featured
      featuredPosts[platform] = post;
    }
    
    // Update UI
    const featuredPostElement = document.getElementById(`${platform}-featured-post`);
    if (featuredPostElement) {
      if (featuredPosts[platform]) {
        // Make sure post has all required properties before using them
        const title = post.title || 'Untitled Post';
        const content = post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : 'No content';
        const status = post.status || 'draft';
        const updatedDate = post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'N/A';
        
        featuredPostElement.innerHTML = `
          <div class="featured-post-item">
            <div class="featured-post-title">${title}</div>
            <div class="featured-post-content">${content}</div>
            <div class="featured-post-meta">
              Status: ${status} | Updated: ${updatedDate}
            </div>
          </div>
        `;
      } else {
        featuredPostElement.innerHTML = '<p>No featured post selected</p>';
      }
    }
    
    // Reload posts to update UI
    if (typeof loadSocialPosts === 'function') {
      loadSocialPosts(platform);
    }
    
  } catch (error) {
    console.error('Error toggling featured post:', error);
    alert('Failed to update featured post. Please try again.');
  }
}

// Save featured posts
async function saveFeaturedPosts() {
  try {
    // Build the request URL
    let saveUrl = '/api/social/save-featured';
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
        featuredPosts
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save featured posts');
    }
    
    // Show success message
    const saveIndicator = document.getElementById('save-featured-indicator');
    saveIndicator.style.display = 'inline';
    
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 3000);
    
    alert('Featured posts saved successfully!');
    
  } catch (error) {
    console.error('Error saving featured posts:', error);
    alert('Failed to save featured posts: ' + error.message);
  }
}

// Load platform settings from the server
async function loadPlatformSettings() {
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
    
    if (site && site.social && site.social.profiles) {
      const profiles = site.social.profiles;
      
      // Twitter
      if (profiles.twitter) {
        document.getElementById('twitter-profile-url').value = profiles.twitter.url || '';
        document.getElementById('twitter-display-name').value = profiles.twitter.displayName || '';
        document.getElementById('twitter-visible').checked = profiles.twitter.visible !== false;
      }
      
      // LinkedIn
      if (profiles.linkedin) {
        document.getElementById('linkedin-profile-url').value = profiles.linkedin.url || '';
        document.getElementById('linkedin-display-name').value = profiles.linkedin.displayName || '';
        document.getElementById('linkedin-visible').checked = profiles.linkedin.visible !== false;
      }
      
      // Facebook
      if (profiles.facebook) {
        document.getElementById('facebook-profile-url').value = profiles.facebook.url || '';
        document.getElementById('facebook-display-name').value = profiles.facebook.displayName || '';
        document.getElementById('facebook-visible').checked = profiles.facebook.visible !== false;
      }
      
      // Instagram
      if (profiles.instagram) {
        document.getElementById('instagram-profile-url').value = profiles.instagram.url || '';
        document.getElementById('instagram-display-name').value = profiles.instagram.displayName || '';
        document.getElementById('instagram-visible').checked = profiles.instagram.visible !== false;
      }
    }
  } catch (error) {
    console.error('Error loading platform settings:', error);
    alert('Failed to load platform settings. Please try again.');
  }
}

// Load social posts for a specific platform
async function loadSocialPosts(platform) {
  try {
    // Show loading message
    document.getElementById(`${platform}-post-list`).innerHTML = '<p>Loading posts...</p>';
    
    // Fetch posts
    let postsUrl = `/api/social/posts?platform=${platform}`;
    if (selectedClientId) {
      postsUrl += '&clientId=' + selectedClientId;
    }
    
    const postsResponse = await fetch(postsUrl);
    if (!postsResponse.ok) throw new Error('Failed to load posts');
    const posts = await postsResponse.json();
    
    // Display posts
    const postsList = document.getElementById(`${platform}-post-list`);
    
    if (posts.length === 0) {
      postsList.innerHTML = `<p>No ${platform} posts found. Click "Add New Post" to create one.</p>`;
      return;
    }
    
    postsList.innerHTML = '';
    
    posts.forEach(post => {
      const postItem = document.createElement('div');
      postItem.className = 'post-item';
      
      // Check if this post is featured
      const isFeatured = featuredPosts[platform] && featuredPosts[platform]._id === post._id;
      if (isFeatured) {
        postItem.classList.add('featured');
      }
      
      const updatedDate = post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'N/A';
      
      postItem.innerHTML = `
        <div>
          <div class="post-item-title">
            ${post.title || 'Untitled Post'}
            ${isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
          </div>
          <div class="post-item-content">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</div>
          <div class="post-item-meta">
            Status: ${post.status} | Updated: ${updatedDate}
          </div>
        </div>
        <div class="post-item-actions">
          <button class="btn btn-sm ${isFeatured ? 'btn-success featured-btn' : 'btn-outline featured-btn'}">
            ${isFeatured ? 'Featured' : 'Set as Featured'}
          </button>
        </div>
      `;
      
      postItem.addEventListener('click', (e) => {
        // If the featured button was clicked
        if (e.target.classList.contains('featured-btn')) {
          e.stopPropagation(); // Prevent opening the editor
          toggleFeaturedPost(platform, post);
        } else {
          // Otherwise open the editor
          editPost(post);
        }
      });
      
      postsList.appendChild(postItem);
    });
    
  } catch (error) {
    console.error(`Error loading ${platform} posts:`, error);
    document.getElementById(`${platform}-post-list`).innerHTML = '<p>Error loading posts. Please try again.</p>';
  }
}

// Save social hub settings
async function saveSocialHubSettings() {
  try {
    // Collect data from form
    const socialSettings = {
      title: document.getElementById('social-hub-title').value,
      description: document.getElementById('social-hub-description').value,
      visible: document.getElementById('social-hub-visible').checked,
      postsPerPage: parseInt(document.getElementById('posts-per-page').value)
    };
    
    // Build the request URL
    let saveUrl = '/api/social/save-settings';
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
        socialSettings
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
    
    alert('Social hub settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving social hub settings:', error);
    alert('Failed to save social hub settings: ' + error.message);
  }
}

// Save platform settings
async function savePlatformSettings() {
  try {
    // Collect data from form
    const platformSettings = {
      twitter: {
        profileUrl: document.getElementById('twitter-profile-url').value,
        displayName: document.getElementById('twitter-display-name').value,
        visible: document.getElementById('twitter-visible').checked
      },
      linkedin: {
        profileUrl: document.getElementById('linkedin-profile-url').value,
        displayName: document.getElementById('linkedin-display-name').value,
        visible: document.getElementById('linkedin-visible').checked
      },
      facebook: {
        profileUrl: document.getElementById('facebook-profile-url').value,
        displayName: document.getElementById('facebook-display-name').value,
        visible: document.getElementById('facebook-visible').checked
      },
      instagram: {
        profileUrl: document.getElementById('instagram-profile-url').value,
        displayName: document.getElementById('instagram-display-name').value,
        visible: document.getElementById('instagram-visible').checked
      }
    };
    
    // Build the request URL
    let saveUrl = '/api/social/save-platforms';
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
        platformSettings
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save changes');
    }
    
    // Show success message
    const saveIndicator = document.getElementById('save-platforms-indicator');
    saveIndicator.style.display = 'inline';
    
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 3000);
    
    alert('Platform settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving platform settings:', error);
    alert('Failed to save platform settings: ' + error.message);
  }
}

// Show new post editor
function showNewPostEditor() {
  // Reset current post ID
  currentPostId = null;
  
  // Reset form fields
  document.getElementById('post-editor-title').textContent = 'New Social Post';
  document.getElementById('post-platform').value = currentPlatform;
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  document.getElementById('post-link').value = '';
  document.getElementById('post-status').value = 'published';
  
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
  document.getElementById('post-editor-title').textContent = 'Edit Social Post';
  document.getElementById('post-platform').value = post.platform;
  document.getElementById('post-title').value = post.title || '';
  document.getElementById('post-content').value = post.content || '';
  document.getElementById('post-link').value = post.link || '';
  document.getElementById('post-status').value = post.status || 'published';
  
  // Show delete button
  document.getElementById('delete-post-btn').style.display = 'inline-block';
  
  // Show post editor
  document.getElementById('post-editor').style.display = 'block';
  
  // Scroll to editor
  document.getElementById('post-editor').scrollIntoView({ behavior: 'smooth' });
  
  // Update current platform
  currentPlatform = post.platform;
}

// Save post
async function savePost() {
  try {
    // Validate required fields
    const platform = document.getElementById('post-platform').value;
    const content = document.getElementById('post-content').value;
    
    if (!platform) {
      alert('Please select a platform');
      return;
    }
    
    if (!content) {
      alert('Please enter post content');
      return;
    }
    
    // Collect data from form
    const post = {
      _id: currentPostId, // Will be null for new posts
      platform: platform,
      title: document.getElementById('post-title').value,
      content: content,
      link: document.getElementById('post-link').value,
      status: document.getElementById('post-status').value
    };
    
    // Build the request URL
    let saveUrl = '/api/social/posts';
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
    
    // Reload posts for the current platform
    loadSocialPosts(platform);
    
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
    
    // Get current platform
    const platform = document.getElementById('post-platform').value;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    // Build the request URL
    let deleteUrl = `/api/social/posts/${currentPostId}`;
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
    
    // Reload posts for the current platform
    loadSocialPosts(platform);
    
    // Hide post editor
    hidePostEditor();
    
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post: ' + error.message);
  }
}
