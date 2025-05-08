// Global Components Editor JavaScript
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
  
  // Load global settings
  loadGlobalSettings();
  
  // Color picker initialization
  initColorPicker();
  
  // Logo upload functionality
  const logoUploadInput = document.getElementById('logo-upload');
  const logoPreview = document.getElementById('logo-preview');
  
  if (logoUploadInput) {
    logoUploadInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          logoPreview.src = e.target.result;
          logoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Save brand settings button click handler
  const saveBrandBtn = document.getElementById('save-brand-btn');
  if (saveBrandBtn) {
    saveBrandBtn.addEventListener('click', saveBrandSettings);
  }
  
  // Save header settings button click handler
  const saveHeaderBtn = document.getElementById('save-header-btn');
  if (saveHeaderBtn) {
    saveHeaderBtn.addEventListener('click', saveHeaderSettings);
  }
  
  // Save footer settings button click handler
  const saveFooterBtn = document.getElementById('save-footer-btn');
  if (saveFooterBtn) {
    saveFooterBtn.addEventListener('click', saveFooterSettings);
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

// Initialize color picker
function initColorPicker() {
  const colorPicker = document.getElementById('primary-color');
  if (colorPicker) {
    colorPicker.addEventListener('input', function() {
      document.getElementById('color-preview').style.backgroundColor = this.value;
    });
  }
}

// Load global settings from the server
async function loadGlobalSettings() {
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
      // Populate brand settings
      if (site.brand) {
        document.getElementById('site-title').value = site.brand.title || 'Self Cast Studios';
        document.getElementById('site-tagline').value = site.brand.tagline || '';
        
        if (site.brand.primaryColor) {
          document.getElementById('primary-color').value = site.brand.primaryColor;
          document.getElementById('color-preview').style.backgroundColor = site.brand.primaryColor;
        }
        
        if (site.brand.logoUrl) {
          document.getElementById('logo-preview').src = site.brand.logoUrl;
          document.getElementById('logo-preview').style.display = 'block';
        }
      }
      
      // Populate header settings
      if (site.header) {
        document.getElementById('show-logo').checked = site.header.showLogo !== false;
        document.getElementById('show-title').checked = site.header.showTitle !== false;
        
        // Populate navigation labels
        if (site.header.navLabels) {
          document.getElementById('home-label').value = site.header.navLabels.home || 'Home';
          document.getElementById('about-label').value = site.header.navLabels.about || 'About';
          document.getElementById('blog-label').value = site.header.navLabels.blog || 'Blog';
          document.getElementById('projects-label').value = site.header.navLabels.projects || 'Projects';
          document.getElementById('social-label').value = site.header.navLabels.social || 'Social';
          document.getElementById('contact-label').value = site.header.navLabels.contact || 'Contact';
        }
        
        // Populate page visibility
        if (site.header.pageVisibility) {
          document.getElementById('home-visible').checked = site.header.pageVisibility.home !== false;
          document.getElementById('about-visible').checked = site.header.pageVisibility.about !== false;
          document.getElementById('blog-visible').checked = site.header.pageVisibility.blog !== false;
          document.getElementById('projects-visible').checked = site.header.pageVisibility.projects !== false;
          document.getElementById('social-visible').checked = site.header.pageVisibility.social !== false;
          document.getElementById('contact-visible').checked = site.header.pageVisibility.contact !== false;
        }
      }
      
      // Populate footer settings
      if (site.footer) {
        document.getElementById('show-contact-info').checked = site.footer.showContactInfo !== false;
        document.getElementById('show-social-icons').checked = site.footer.showSocialIcons !== false;
        document.getElementById('show-footer-links').checked = site.footer.showFooterLinks !== false;
        document.getElementById('copyright-text').value = site.footer.copyrightText || '© Self Cast Studios';
      }
    }
  } catch (error) {
    console.error('Error loading global settings:', error);
    alert('Failed to load global settings. Please try again.');
  }
}

// Save brand settings
async function saveBrandSettings() {
  try {
    // Get logo file if uploaded
    const logoUploadInput = document.getElementById('logo-upload');
    let logoFile = null;
    if (logoUploadInput && logoUploadInput.files.length > 0) {
      logoFile = logoUploadInput.files[0];
    }
    
    // Collect data from form
    const brandSettings = {
      title: document.getElementById('site-title').value,
      tagline: document.getElementById('site-tagline').value,
      primaryColor: document.getElementById('primary-color').value
    };
    
    // Build the request URL
    let saveUrl = '/api/global/save-brand';
    if (selectedClientId) {
      saveUrl += '?clientId=' + selectedClientId;
    }
    
    // Create form data if there's a logo file
    let requestOptions = {};
    
    if (logoFile) {
      const formData = new FormData();
      formData.append('logo', logoFile);
      formData.append('brandSettings', JSON.stringify(brandSettings));
      
      requestOptions = {
        method: 'POST',
        body: formData
      };
    } else {
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandSettings
        })
      };
    }
    
    // Send data to server
    const response = await fetch(saveUrl, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save changes');
    }
    
    // Show success message
    const saveIndicator = document.getElementById('save-brand-indicator');
    saveIndicator.style.display = 'inline';
    
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 3000);
    
    alert('Brand settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving brand settings:', error);
    alert('Failed to save brand settings: ' + error.message);
  }
}

// Save header settings
async function saveHeaderSettings() {
  try {
    // Collect data from form
    const headerSettings = {
      showLogo: document.getElementById('show-logo').checked,
      showTitle: document.getElementById('show-title').checked,
      
      // Navigation labels
      navLabels: {
        home: document.getElementById('home-label').value,
        about: document.getElementById('about-label').value,
        blog: document.getElementById('blog-label').value,
        projects: document.getElementById('projects-label').value,
        social: document.getElementById('social-label').value,
        contact: document.getElementById('contact-label').value
      },
      
      // Page visibility
      pageVisibility: {
        home: document.getElementById('home-visible').checked,
        about: document.getElementById('about-visible').checked,
        blog: document.getElementById('blog-visible').checked,
        projects: document.getElementById('projects-visible').checked,
        social: document.getElementById('social-visible').checked,
        contact: document.getElementById('contact-visible').checked
      }
    };
    
    // Build the request URL
    let saveUrl = '/api/global/save-header';
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
        headerSettings
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save changes');
    }
    
    // Show success message
    const saveIndicator = document.getElementById('save-header-indicator');
    saveIndicator.style.display = 'inline';
    
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 3000);
    
    alert('Header settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving header settings:', error);
    alert('Failed to save header settings: ' + error.message);
  }
}

// Save footer settings
async function saveFooterSettings() {
  try {
    // Collect data from form
    const footerSettings = {
      showContactInfo: document.getElementById('show-contact-info').checked,
      showSocialIcons: document.getElementById('show-social-icons').checked,
      showFooterLinks: document.getElementById('show-footer-links').checked,
      copyrightText: document.getElementById('copyright-text').value
    };
    
    // Build the request URL
    let saveUrl = '/api/global/save-footer';
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
        footerSettings
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save changes');
    }
    
    // Show success message
    const saveIndicator = document.getElementById('save-footer-indicator');
    saveIndicator.style.display = 'inline';
    
    setTimeout(() => {
      saveIndicator.style.display = 'none';
    }, 3000);
    
    alert('Footer settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving footer settings:', error);
    alert('Failed to save footer settings: ' + error.message);
  }
}
