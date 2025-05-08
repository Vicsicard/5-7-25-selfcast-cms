const express = require('express');
const payload = require('payload');
const path = require('path');
require('dotenv').config();

// Create Express app
const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin');
});

// Initialize Payload
async function start() {
  try {
    // Initialize Payload with simplified configuration
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'selfcast-studios-secret-key',
      mongoURL: process.env.MONGODB_URI,
      express: app,
      onInit: () => {
        console.log(`🚀 Payload Admin URL: ${payload.getAdminURL()}`);
      },
      email: {
        fromName: 'Self Cast Studios',
        fromAddress: 'noreply@selfcaststudios.com',
      },
      // Basic collections without complex dependencies
      collections: [
        // Define a minimal Sites collection
        {
          slug: 'sites',
          admin: {
            useAsTitle: 'title',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        // Basic Blog Posts collection
        {
          slug: 'blog-posts',
          admin: {
            useAsTitle: 'title',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
            },
            {
              name: 'publishedDate',
              type: 'date',
            }
          ],
        },
        // Basic Social Posts collection
        {
          slug: 'social-posts',
          admin: {
            useAsTitle: 'title',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
            },
            {
              name: 'platform',
              type: 'select',
              options: ['LinkedIn', 'Twitter', 'Instagram', 'Facebook'],
            }
          ],
        }
      ],
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server started successfully: http://localhost:${PORT}`);
      console.log(`💻 Admin panel available at: http://localhost:${PORT}/admin`);
      console.log(`🔌 API accessible at: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Error starting Payload CMS:', error);
  }
}

start();
