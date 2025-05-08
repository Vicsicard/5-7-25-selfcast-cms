// Contact Page Editor Route Module
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Create router
const router = express.Router();

// Contact Page Editor Route
router.get('/editor/contact', (req, res) => {
  // If not logged in, redirect to login
  if (!req.user) {
    return res.redirect('/login');
  }
  
  // Render the contact page editor
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contact Page Editor - Self Cast Studios CMS</title>
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
        .btn-sm { padding: 5px 10px; font-size: 14px; }
        .save-indicator { display: none; margin-right: 10px; color: #10b981; }
        .tab-container { border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }
        .tabs { display: flex; gap: 5px; }
        .tab { padding: 10px 15px; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: bold; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .field-group { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .field-group-title { font-weight: bold; margin-bottom: 15px; color: #64748b; }
        .admin-only { display: none; }
        body.is-admin .admin-only { display: block; }
        .service-interest-option { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f1f5f9; border-radius: 4px; margin-bottom: 8px; }
        .service-interest-option.highlight { background: #dbeafe; }
        .btn-remove { background: none; border: none; color: #64748b; font-size: 18px; cursor: pointer; }
        .btn-remove:hover { color: #ef4444; }
        .service-interest-add { display: flex; gap: 10px; margin-top: 10px; }
        .message-item { background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #cbd5e1; }
        .message-item.unread { border-left-color: #3b82f6; background: #f0f9ff; }
        .message-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .message-info { flex: 1; }
        .message-sender { font-weight: bold; font-size: 16px; }
        .message-date { color: #64748b; font-size: 14px; }
        .message-status { display: flex; gap: 5px; }
        .message-subject { font-size: 18px; margin-bottom: 10px; }
        .message-content { background: white; padding: 10px; border-radius: 4px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
        .message-contact { display: flex; gap: 15px; margin-bottom: 10px; font-size: 14px; color: #64748b; }
        .message-notes-container { margin-top: 10px; }
        .message-notes { margin: 5px 0; }
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
        <h1>Contact Page Editor</h1>
        <div class="user-info">
          <div class="user-badge">${req.user.role === 'admin' ? 'Admin' : 'User'}: ${req.user.email}</div>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      </div>
      
      <div class="container">
        <div class="breadcrumb">
          <a href="/">Dashboard</a>
          <span>›</span>
          <a href="/editor/contact">Contact Page Editor</a>
        </div>
        
        <div class="tab-container">
          <div class="tabs">
            <div class="tab active" data-tab="general-settings">General Settings</div>
            <div class="tab admin-only" data-tab="messages">Messages</div>
          </div>
        </div>
        
        <!-- General Settings Tab -->
        <div id="general-settings" class="tab-content active">
          <!-- Contact Page Settings -->
          <div class="section-card">
            <div class="section-header">
              <h2>Contact Page Settings</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="contact-page-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="form-group">
              <label for="contact-page-title">Page Title</label>
              <input type="text" id="contact-page-title" class="form-control" placeholder="Contact Us">
            </div>
            
            <div class="form-group">
              <label for="contact-page-description">Page Description</label>
              <textarea id="contact-page-description" class="form-control" placeholder="Get in touch with our team..."></textarea>
            </div>
          </div>
          
          <!-- Contact Information -->
          <div class="section-card">
            <div class="section-header">
              <h2>Contact Information</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="contact-info-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p>This information will be displayed in the contact sidebar</p>
            
            <div class="form-group">
              <label for="business-name">Business Name</label>
              <input type="text" id="business-name" class="form-control" placeholder="Self Cast Studios">
            </div>
            
            <div class="form-group">
              <label for="business-email">Email Address</label>
              <input type="email" id="business-email" class="form-control" placeholder="contact@example.com">
            </div>
            
            <div class="form-group">
              <label for="business-phone">Phone Number</label>
              <input type="tel" id="business-phone" class="form-control" placeholder="(123) 456-7890">
            </div>
            
            <div class="form-group">
              <label for="business-address">Business Address</label>
              <textarea id="business-address" class="form-control" placeholder="123 Main St, City, State, ZIP"></textarea>
            </div>
          </div>
          
          <!-- Contact Form Settings -->
          <div class="section-card">
            <div class="section-header">
              <h2>Contact Form Settings</h2>
              <label class="toggle-switch">
                <input type="checkbox" id="contact-form-visible" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p>Customize the contact form appearance and behavior</p>
            
            <div class="form-group">
              <label for="form-title">Form Title</label>
              <input type="text" id="form-title" class="form-control" placeholder="Send Us a Message">
            </div>
            
            <div class="form-group">
              <label for="form-description">Form Description</label>
              <textarea id="form-description" class="form-control" placeholder="Fill out the form below to get in touch with our team..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="success-message">Success Message</label>
              <textarea id="success-message" class="form-control" placeholder="Thank you for your message. We will get back to you soon!"></textarea>
            </div>
            
            <div class="field-group">
              <div class="field-group-title">Service Interest Options</div>
              <label class="toggle-switch">
                <input type="checkbox" id="service-interest-visible" checked>
                <span class="toggle-slider"></span>
              </label>
              <p>Add options that will appear in the "Service Interest" dropdown on the contact form</p>
              
              <div id="service-interest-list">
                <!-- Service interest options will be added here -->
              </div>
              
              <div class="service-interest-add">
                <input type="text" id="service-interest-options" class="form-control" placeholder="New service option">
                <button id="add-service-interest" class="btn btn-primary">Add Option</button>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="btn-row">
            <span id="save-indicator" class="save-indicator">✓ Changes saved</span>
            <button id="preview-btn" class="btn btn-secondary">Preview Changes</button>
            <button id="save-general-btn" class="btn btn-primary">Save Changes</button>
            <button id="publish-btn" class="btn btn-success">Publish to Website</button>
          </div>
        </div>
        
        <!-- Messages Tab (Admin Only) -->
        <div id="messages" class="tab-content admin-only">
          <div class="section-card">
            <div class="section-header">
              <h2>Contact Form Messages</h2>
            </div>
            
            <div id="messages-list">
              <p>Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
      
      <script src="/js/contact-editor.js"></script>
    </body>
    </html>
  `);
});

// API endpoint to save contact page settings
router.post('/api/contact/save-settings', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Get client ID from query parameter if present
    const clientId = req.query.clientId || req.user._id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get the site document
    const sitesCollection = db.collection('sites');
    const site = await sitesCollection.findOne({ clientId });
    
    if (!site) {
      await client.close();
      return res.status(404).json({ error: 'Site not found' });
    }
    
    // Update the site document with contact settings
    const contactSettings = req.body.contactSettings;
    
    // Ensure contact object exists
    if (!site.contact) {
      site.contact = {};
    }
    
    // Update contact settings
    site.contact = {
      ...site.contact,
      ...contactSettings,
      updatedAt: new Date()
    };
    
    // Save to database
    await sitesCollection.updateOne({ _id: site._id }, { $set: { contact: site.contact } });
    
    await client.close();
    
    res.json({ success: true, message: 'Contact page settings saved successfully' });
    
  } catch (error) {
    console.error('Error saving contact page settings:', error);
    res.status(500).json({ error: 'Failed to save contact page settings' });
  }
});

// API endpoint to get messages
router.get('/api/messages', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Only admins can view messages
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    // Get client ID from query parameter if present
    const clientId = req.query.clientId || req.user._id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get messages
    const messagesCollection = db.collection('messages');
    const messages = await messagesCollection.find({ clientId }).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    res.json(messages);
    
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// API endpoint to toggle message read status
router.post('/api/messages/:id/toggle-read', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Only admins can update messages
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    const messageId = req.params.id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get the message
    const messagesCollection = db.collection('messages');
    const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
    
    if (!message) {
      await client.close();
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Toggle read status
    const newReadStatus = !message.read;
    
    // Update the message
    await messagesCollection.updateOne(
      { _id: new ObjectId(messageId) },
      { 
        $set: { 
          read: newReadStatus,
          updatedAt: new Date()
        } 
      }
    );
    
    await client.close();
    
    res.json({ success: true, read: newReadStatus });
    
  } catch (error) {
    console.error('Error toggling message read status:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// API endpoint to save message notes
router.post('/api/messages/:id/notes', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Only admins can update messages
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    const messageId = req.params.id;
    const notes = req.body.notes;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Get the message
    const messagesCollection = db.collection('messages');
    const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
    
    if (!message) {
      await client.close();
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Update the message
    await messagesCollection.updateOne(
      { _id: new ObjectId(messageId) },
      { 
        $set: { 
          notes: notes,
          updatedAt: new Date()
        } 
      }
    );
    
    await client.close();
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error saving message notes:', error);
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// API endpoint to delete a message
router.delete('/api/messages/:id', async (req, res) => {
  try {
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Please login' });
    }
    
    // Only admins can delete messages
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    const messageId = req.params.id;
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Delete the message
    const messagesCollection = db.collection('messages');
    const result = await messagesCollection.deleteOne({ _id: new ObjectId(messageId) });
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// API endpoint to submit a contact form message
router.post('/api/messages', async (req, res) => {
  try {
    const { name, email, phone, subject, serviceInterest, message, clientId } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message || !clientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('selfcast-cms');
    
    // Create new message
    const messagesCollection = db.collection('messages');
    const newMessage = {
      clientId,
      name,
      email,
      phone: phone || '',
      subject,
      serviceInterest: serviceInterest || '',
      message,
      read: false,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database
    const result = await messagesCollection.insertOne(newMessage);
    
    await client.close();
    
    res.json({ success: true, messageId: result.insertedId });
    
  } catch (error) {
    console.error('Error submitting message:', error);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

module.exports = router;
