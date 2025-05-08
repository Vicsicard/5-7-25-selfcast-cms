// About Page Editor JavaScript
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
  
  // Load about page data
  loadAboutPageData();
  
  // Setup image preview
  setupImagePreview('profile-image', 'profile-preview');
  
  // Save button click handler
  document.getElementById('save-btn').addEventListener('click', saveAboutPageData);
  
  // Preview button click handler
  document.getElementById('preview-btn').addEventListener('click', () => {
    alert('Preview functionality will be implemented in the next phase.');
  });
  
  // Publish button click handler
  document.getElementById('publish-btn').addEventListener('click', () => {
    alert('Publish functionality will be implemented in the next phase.');
  });
});

// Load about page data from the server
async function loadAboutPageData() {
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
    
    if (site && site.about) {
      // Populate page header
      document.getElementById('about-title').value = site.about.title || '';
      document.getElementById('about-subtitle').value = site.about.subtitle || '';
      document.getElementById('about-visible').checked = site.about.visible !== false;
      
      // Populate about content
      document.getElementById('content-subheading').value = site.about.contentSubheading || '';
      document.getElementById('about-content').value = site.about.content || '';
      
      // Populate contact information
      document.getElementById('contact-heading').value = site.about.contactHeading || '';
      
      if (site.about.contact) {
        document.getElementById('business-name').value = site.about.contact.businessName || '';
        document.getElementById('contact-email').value = site.about.contact.email || '';
        document.getElementById('contact-phone').value = site.about.contact.phone || '';
      }
      
      // If there's a profile image, show it in the preview
      if (site.about.profileImage) {
        document.getElementById('profile-preview').innerHTML = 
          '<img src="' + site.about.profileImage + '" alt="Profile Preview" class="image-preview">';
      }
    }
  } catch (error) {
    console.error('Error loading about page data:', error);
    alert('Failed to load about page data. Please try again.');
  }
}

// Save about page data to the server
async function saveAboutPageData() {
  try {
    // Collect data from form
    const aboutData = {
      title: document.getElementById('about-title').value,
      subtitle: document.getElementById('about-subtitle').value,
      contentSubheading: document.getElementById('content-subheading').value,
      content: document.getElementById('about-content').value,
      contactHeading: document.getElementById('contact-heading').value,
      contact: {
        businessName: document.getElementById('business-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value
      },
      visible: document.getElementById('about-visible').checked,
      
      // For now, we'll just keep any existing profile image
      // In a real implementation, we would handle file uploads here
      profileImage: document.querySelector('#profile-preview img') ? 
        document.querySelector('#profile-preview img').src : ''
    };
    
    // Build the request URL
    let saveUrl = '/api/about/save';
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
        aboutData
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
