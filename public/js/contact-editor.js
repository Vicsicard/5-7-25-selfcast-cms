// Contact Page Editor JavaScript
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
  
  // Load contact page settings
  loadContactPageSettings();
  
  // Load messages if admin
  if (isAdmin) {
    loadMessages();
  }
  
  // Save general settings button click handler
  const saveGeneralBtn = document.getElementById('save-general-btn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', saveContactPageSettings);
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
  
  // Mark as read button click handler for messages
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('mark-read-btn')) {
      const messageId = e.target.getAttribute('data-id');
      toggleMessageReadStatus(messageId);
    }
  });
  
  // Save notes button click handler for messages
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('save-notes-btn')) {
      const messageId = e.target.getAttribute('data-id');
      const notesTextarea = document.querySelector(`.message-notes[data-id="${messageId}"]`);
      if (notesTextarea) {
        saveMessageNotes(messageId, notesTextarea.value);
      }
    }
  });
  
  // Delete message button click handler
  document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('delete-message-btn')) {
      const messageId = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
        deleteMessage(messageId);
      }
    }
  });
  
  // Service interest options handler
  const serviceInterestSelect = document.getElementById('service-interest-options');
  const serviceInterestList = document.getElementById('service-interest-list');
  const addServiceInterestBtn = document.getElementById('add-service-interest');
  
  if (addServiceInterestBtn && serviceInterestSelect && serviceInterestList) {
    addServiceInterestBtn.addEventListener('click', () => {
      const option = serviceInterestSelect.value.trim();
      if (option) {
        addServiceInterestOption(option);
        serviceInterestSelect.value = '';
      }
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

// Load contact page settings from the server
async function loadContactPageSettings() {
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
    
    if (site && site.contact) {
      // Populate contact page settings
      document.getElementById('contact-page-title').value = site.contact.title || 'Contact Us';
      document.getElementById('contact-page-description').value = site.contact.description || '';
      document.getElementById('contact-page-visible').checked = site.contact.visible !== false;
      
      // Populate section visibility settings
      document.getElementById('contact-info-visible').checked = site.contact.contactInfoVisible !== false;
      document.getElementById('contact-form-visible').checked = site.contact.contactFormVisible !== false;
      document.getElementById('service-interest-visible').checked = site.contact.serviceInterestVisible !== false;
      
      // Populate contact info
      document.getElementById('business-name').value = site.contact.businessName || '';
      document.getElementById('business-email').value = site.contact.email || '';
      document.getElementById('business-phone').value = site.contact.phone || '';
      document.getElementById('business-address').value = site.contact.address || '';
      
      // Populate form settings
      document.getElementById('form-title').value = site.contact.formTitle || 'Send Us a Message';
      document.getElementById('form-description').value = site.contact.formDescription || '';
      document.getElementById('success-message').value = site.contact.successMessage || 'Thank you for your message. We will get back to you soon!';
      
      // Populate service interest options
      const serviceInterestList = document.getElementById('service-interest-list');
      if (serviceInterestList && site.contact.serviceInterestOptions) {
        serviceInterestList.innerHTML = '';
        site.contact.serviceInterestOptions.forEach(option => {
          addServiceInterestOption(option, false);
        });
      }
    }
  } catch (error) {
    console.error('Error loading contact page settings:', error);
    alert('Failed to load contact page settings. Please try again.');
  }
}

// Load messages from the server (admin only)
async function loadMessages() {
  try {
    // Fetch messages
    let messagesUrl = '/api/messages';
    if (selectedClientId) {
      messagesUrl += '?clientId=' + selectedClientId;
    }
    
    const messagesResponse = await fetch(messagesUrl);
    if (!messagesResponse.ok) throw new Error('Failed to load messages');
    const messages = await messagesResponse.json();
    
    // Display messages
    const messagesList = document.getElementById('messages-list');
    
    if (!messagesList) return;
    
    if (messages.length === 0) {
      messagesList.innerHTML = '<p>No messages found.</p>';
      return;
    }
    
    messagesList.innerHTML = '';
    
    messages.forEach(message => {
      const messageItem = document.createElement('div');
      messageItem.className = `message-item ${message.read ? 'read' : 'unread'}`;
      
      const createdDate = message.createdAt ? new Date(message.createdAt).toLocaleDateString() : 'N/A';
      
      messageItem.innerHTML = `
        <div class="message-header">
          <div class="message-info">
            <div class="message-sender">${message.name}</div>
            <div class="message-date">${createdDate}</div>
          </div>
          <div class="message-status">
            <button class="btn btn-sm mark-read-btn" data-id="${message._id}">
              ${message.read ? 'Mark as Unread' : 'Mark as Read'}
            </button>
            <button class="btn btn-sm btn-danger delete-message-btn" data-id="${message._id}">
              Delete
            </button>
          </div>
        </div>
        <div class="message-subject">${message.subject}</div>
        <div class="message-content">${message.message}</div>
        <div class="message-contact">
          <div><strong>Email:</strong> ${message.email}</div>
          ${message.phone ? `<div><strong>Phone:</strong> ${message.phone}</div>` : ''}
          ${message.serviceInterest ? `<div><strong>Service Interest:</strong> ${message.serviceInterest}</div>` : ''}
        </div>
        <div class="message-notes-container">
          <label for="message-notes-${message._id}">Admin Notes:</label>
          <textarea class="form-control message-notes" id="message-notes-${message._id}" data-id="${message._id}" rows="2">${message.notes || ''}</textarea>
          <button class="btn btn-sm btn-primary save-notes-btn" data-id="${message._id}">Save Notes</button>
        </div>
      `;
      
      messagesList.appendChild(messageItem);
    });
    
  } catch (error) {
    console.error('Error loading messages:', error);
    const messagesList = document.getElementById('messages-list');
    if (messagesList) {
      messagesList.innerHTML = '<p>Error loading messages. Please try again.</p>';
    }
  }
}

// Save contact page settings
async function saveContactPageSettings() {
  try {
    // Collect data from form
    const contactSettings = {
      title: document.getElementById('contact-page-title').value,
      description: document.getElementById('contact-page-description').value,
      visible: document.getElementById('contact-page-visible').checked,
      
      // Section visibility
      contactInfoVisible: document.getElementById('contact-info-visible').checked,
      contactFormVisible: document.getElementById('contact-form-visible').checked,
      serviceInterestVisible: document.getElementById('service-interest-visible').checked,
      
      // Contact info
      businessName: document.getElementById('business-name').value,
      email: document.getElementById('business-email').value,
      phone: document.getElementById('business-phone').value,
      address: document.getElementById('business-address').value,
      
      // Form settings
      formTitle: document.getElementById('form-title').value,
      formDescription: document.getElementById('form-description').value,
      successMessage: document.getElementById('success-message').value,
      
      // Service interest options
      serviceInterestOptions: getServiceInterestOptions()
    };
    
    // Build the request URL
    let saveUrl = '/api/contact/save-settings';
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
        contactSettings
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
    
    alert('Contact page settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving contact page settings:', error);
    alert('Failed to save contact page settings: ' + error.message);
  }
}

// Toggle message read status
async function toggleMessageReadStatus(messageId) {
  try {
    // Build the request URL
    let updateUrl = `/api/messages/${messageId}/toggle-read`;
    if (selectedClientId) {
      updateUrl += '?clientId=' + selectedClientId;
    }
    
    // Send data to server
    const response = await fetch(updateUrl, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update message status');
    }
    
    // Reload messages
    loadMessages();
    
  } catch (error) {
    console.error('Error updating message status:', error);
    alert('Failed to update message status: ' + error.message);
  }
}

// Save message notes
async function saveMessageNotes(messageId, notes) {
  try {
    // Build the request URL
    let updateUrl = `/api/messages/${messageId}/notes`;
    if (selectedClientId) {
      updateUrl += '?clientId=' + selectedClientId;
    }
    
    // Send data to server
    const response = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notes
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save notes');
    }
    
    // Show success message
    alert('Notes saved successfully!');
    
  } catch (error) {
    console.error('Error saving notes:', error);
    alert('Failed to save notes: ' + error.message);
  }
}

// Delete message
async function deleteMessage(messageId) {
  try {
    // Build the request URL
    let deleteUrl = `/api/messages/${messageId}`;
    if (selectedClientId) {
      deleteUrl += '?clientId=' + selectedClientId;
    }
    
    // Send delete request
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete message');
    }
    
    // Reload messages
    loadMessages();
    
    // Show success message
    alert('Message deleted successfully!');
    
  } catch (error) {
    console.error('Error deleting message:', error);
    alert('Failed to delete message: ' + error.message);
  }
}

// Add service interest option
function addServiceInterestOption(option, isNew = true) {
  const serviceInterestList = document.getElementById('service-interest-list');
  if (!serviceInterestList) return;
  
  const optionItem = document.createElement('div');
  optionItem.className = 'service-interest-option';
  optionItem.innerHTML = `
    <span>${option}</span>
    <button type="button" class="btn-remove">×</button>
  `;
  
  // Remove option on button click
  const removeButton = optionItem.querySelector('.btn-remove');
  removeButton.addEventListener('click', () => {
    serviceInterestList.removeChild(optionItem);
  });
  
  serviceInterestList.appendChild(optionItem);
  
  // If this is a new option, highlight it briefly
  if (isNew) {
    optionItem.classList.add('highlight');
    setTimeout(() => {
      optionItem.classList.remove('highlight');
    }, 1000);
  }
}

// Get service interest options
function getServiceInterestOptions() {
  const serviceInterestList = document.getElementById('service-interest-list');
  if (!serviceInterestList) return [];
  
  const options = [];
  const optionElements = serviceInterestList.querySelectorAll('.service-interest-option span');
  
  optionElements.forEach(element => {
    options.push(element.textContent);
  });
  
  return options;
}
