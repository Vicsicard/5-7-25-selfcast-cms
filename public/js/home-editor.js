// Homepage Editor JavaScript
document.addEventListener('DOMContentLoaded', function() {
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
  const selectedClientId = localStorage.getItem('selectedClientId');
  
  // Load homepage data
  loadHomepageData();
  
  // Setup image previews
  setupImagePreview('profile-image', 'profile-preview');
  setupImagePreview('banner1-image', 'banner1-preview');
  setupImagePreview('banner2-image', 'banner2-preview');
  
  // Save button click handler
  document.getElementById('save-btn').addEventListener('click', saveHomepageData);
  
  // Preview button click handler
  document.getElementById('preview-btn').addEventListener('click', () => {
    alert('Preview functionality will be implemented in the next phase.');
  });
  
  // Publish button click handler
  document.getElementById('publish-btn').addEventListener('click', () => {
    alert('Publish functionality will be implemented in the next phase.');
  });
});

// Load homepage data from the server
async function loadHomepageData() {
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
    
    if (site) {
      // Populate hero section
      document.getElementById('hero-title').value = site.title || site.headline || '';
      document.getElementById('hero-tagline').value = site.tagline || site.description || '';
      document.getElementById('hero-visible').checked = site.sections && site.sections.hero && site.sections.hero.visible !== false;
      
      // Populate about section visibility
      document.getElementById('about-visible').checked = site.sections && site.sections.about && site.sections.about.visible !== false;
      
      // Populate banner sections
      if (site.banners && site.banners.length > 0) {
        if (site.banners[0]) {
          document.getElementById('banner1-title').value = site.banners[0].title || '';
          document.getElementById('banner1-caption').value = site.banners[0].caption || '';
          document.getElementById('banner1-visible').checked = site.sections && site.sections.banner1 && site.sections.banner1.visible !== false;
        }
        
        if (site.banners[1]) {
          document.getElementById('banner2-title').value = site.banners[1].title || '';
          document.getElementById('banner2-caption').value = site.banners[1].caption || '';
          document.getElementById('banner2-visible').checked = site.sections && site.sections.banner2 && site.sections.banner2.visible !== false;
        }
      }
      
      // Populate section visibility
      document.getElementById('social-visible').checked = site.sections && site.sections.socialMedia && site.sections.socialMedia.visible !== false;
      document.getElementById('blog-visible').checked = site.sections && site.sections.blogPosts && site.sections.blogPosts.visible !== false;
      document.getElementById('contact-visible').checked = site.sections && site.sections.contact && site.sections.contact.visible !== false;
      
      // Populate contact info
      document.getElementById('contact-info').value = site.contactInfo || '';
    }
    
    // Fetch quotes
    let quotesUrl = '/api/quotes';
    if (selectedClientId) {
      quotesUrl += '?clientId=' + selectedClientId;
    }
    
    const quotesResponse = await fetch(quotesUrl);
    if (!quotesResponse.ok) throw new Error('Failed to load quotes');
    const quotes = await quotesResponse.json();
    
    // Populate quote cards
    if (quotes.length > 0) {
      document.getElementById('quote1-content').value = quotes[0] ? quotes[0].content || '' : '';
      document.getElementById('quote1-author').value = quotes[0] ? quotes[0].author || '' : '';
    }
    
    if (quotes.length > 1) {
      document.getElementById('quote2-content').value = quotes[1] ? quotes[1].content || '' : '';
      document.getElementById('quote2-author').value = quotes[1] ? quotes[1].author || '' : '';
    }
    
    if (quotes.length > 2) {
      document.getElementById('quote3-content').value = quotes[2] ? quotes[2].content || '' : '';
      document.getElementById('quote3-author').value = quotes[2] ? quotes[2].author || '' : '';
    }
    
    // Load social posts
    loadSocialPosts();
    
    // Load blog posts
    loadBlogPosts();
    
  } catch (error) {
    console.error('Error loading homepage data:', error);
    alert('Failed to load homepage data. Please try again.');
  }
}

// Load social media posts
async function loadSocialPosts() {
  try {
    let socialUrl = '/api/socialposts';
    if (selectedClientId) {
      socialUrl += '?clientId=' + selectedClientId;
    }
    
    const response = await fetch(socialUrl);
    if (!response.ok) throw new Error('Failed to load social posts');
    const posts = await response.json();
    
    const container = document.getElementById('social-posts-container');
    
    if (posts.length === 0) {
      container.innerHTML = '<p>No social media posts found. Create some posts to display them here.</p>';
      return;
    }
    
    // Group posts by platform
    const platforms = ['linkedin', 'instagram', 'facebook', 'twitter'];
    let html = '';
    
    platforms.forEach(platform => {
      const platformPosts = posts.filter(post => post.platform === platform);
      
      if (platformPosts.length > 0) {
        html += '<h3>' + platform.charAt(0).toUpperCase() + platform.slice(1) + ' Posts</h3>';
        html += '<div class="form-group">';
        
        platformPosts.forEach(post => {
          const postId = post._id || post.id;
          const postContent = post.content || '';
          const truncatedContent = postContent.length > 100 ? 
            postContent.substring(0, 100) + '...' : 
            postContent;
          const checkedAttr = post.featured ? 'checked' : '';
          
          html += '<div class="quote-card">';
          html += '<input type="checkbox" id="social-' + postId + '" class="social-post-checkbox" data-id="' + postId + '" ' + checkedAttr + '>';
          html += '<label for="social-' + postId + '">' + truncatedContent + '</label>';
          html += '</div>';
        });
        
        html += '</div>';
      }
    });
    
    container.innerHTML = html || '<p>No social media posts found. Create some posts to display them here.</p>';
    
  } catch (error) {
    console.error('Error loading social posts:', error);
    document.getElementById('social-posts-container').innerHTML = 
      '<p>Failed to load social media posts. Please try again.</p>';
  }
}

// Load blog posts
async function loadBlogPosts() {
  try {
    let blogUrl = '/api/blogposts';
    if (selectedClientId) {
      blogUrl += '?clientId=' + selectedClientId;
    }
    
    const response = await fetch(blogUrl);
    if (!response.ok) throw new Error('Failed to load blog posts');
    const posts = await response.json();
    
    const container = document.getElementById('blog-posts-container');
    
    if (posts.length === 0) {
      container.innerHTML = '<p>No blog posts found. Create some posts to display them here.</p>';
      return;
    }
    
    let html = '<div class="form-group">';
    
    posts.forEach(post => {
      const postId = post._id || post.id;
      const postTitle = post.title || '';
      const checkedAttr = post.featured ? 'checked' : '';
      
      html += '<div class="quote-card">';
      html += '<input type="checkbox" id="blog-' + postId + '" class="blog-post-checkbox" data-id="' + postId + '" ' + checkedAttr + '>';
      html += '<label for="blog-' + postId + '">' + postTitle + '</label>';
      html += '</div>';
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading blog posts:', error);
    document.getElementById('blog-posts-container').innerHTML = 
      '<p>Failed to load blog posts. Please try again.</p>';
  }
}

// Save homepage data to the server
async function saveHomepageData() {
  try {
    // Collect data from form
    const siteData = {
      title: document.getElementById('hero-title').value,
      tagline: document.getElementById('hero-tagline').value,
      sections: {
        hero: { visible: document.getElementById('hero-visible').checked },
        about: { visible: document.getElementById('about-visible').checked },
        banner1: { visible: document.getElementById('banner1-visible').checked },
        banner2: { visible: document.getElementById('banner2-visible').checked },
        socialMedia: { visible: document.getElementById('social-visible').checked },
        blogPosts: { visible: document.getElementById('blog-visible').checked },
        contact: { visible: document.getElementById('contact-visible').checked }
      },
      banners: [
        {
          title: document.getElementById('banner1-title').value,
          caption: document.getElementById('banner1-caption').value
        },
        {
          title: document.getElementById('banner2-title').value,
          caption: document.getElementById('banner2-caption').value
        }
      ],
      contactInfo: document.getElementById('contact-info').value
    };
    
    // Collect quote data
    const quoteData = [
      {
        content: document.getElementById('quote1-content').value,
        author: document.getElementById('quote1-author').value
      },
      {
        content: document.getElementById('quote2-content').value,
        author: document.getElementById('quote2-author').value
      },
      {
        content: document.getElementById('quote3-content').value,
        author: document.getElementById('quote3-author').value
      }
    ];
    
    // Collect selected social posts
    const socialPostCheckboxes = document.querySelectorAll('.social-post-checkbox');
    const selectedSocialPosts = Array.from(socialPostCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.dataset.id);
    
    // Collect selected blog posts
    const blogPostCheckboxes = document.querySelectorAll('.blog-post-checkbox');
    const selectedBlogPosts = Array.from(blogPostCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.dataset.id);
    
    // Build the request URL
    let saveUrl = '/api/homepage/save';
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
        siteData,
        quoteData,
        selectedSocialPosts,
        selectedBlogPosts
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
    
    alert('Changes saved successfully!');
    
  } catch (error) {
    console.error('Error saving changes:', error);
    alert('Failed to save changes: ' + error.message);
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
        preview.innerHTML = '<img src="' + event.target.result + '" alt="Preview" class="image-preview">';
      };
      reader.readAsDataURL(file);
    }
  });
}
