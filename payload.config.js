// Root payload.config.js for Vercel deployment
const { buildConfig } = require('payload/config');
const { mongooseAdapter } = require('@payloadcms/db-mongodb');

const config = buildConfig({
  // Add serverURL for proper URL generation in production
  serverURL: process.env.NODE_ENV === 'production' 
    ? 'https://5-7-25-selfcast-cms.vercel.app'
    : 'http://localhost:3000',
  
  // Configure CORS for security
  cors: process.env.NODE_ENV === 'production' 
    ? [process.env.NEXT_PUBLIC_API_URL, 'https://5-7-25-selfcast-cms.vercel.app'] 
    : ['http://localhost:3000'],
  
  // Set cookie prefix for better security
  cookiePrefix: 'selfcast_cms',
  
  // Configure admin panel
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Self Cast Studios CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  
  // Configure MongoDB adapter
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
    connectOptions: {
      // Recommended options for serverless environments
      maxPoolSize: 10, // Limit connections for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    },
  }),
  
  // Add security measures
  rateLimit: {
    window: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per window
  },
  maxDepth: 10, // Prevent excessive query depth
  
  // Include minimal collections
  collections: [
    // Add a minimal users collection
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        }
      ],
    },
    // Add a minimal media collection
    {
      slug: 'media',
      upload: {
        staticURL: '/media',
        staticDir: 'media',
        mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
      },
      fields: [],
    }
  ],
});

module.exports = config;
