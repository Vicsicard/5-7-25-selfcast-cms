const { buildConfig } = require('payload/config');
const { mongooseAdapter } = require('@payloadcms/db-mongodb');
const { webpackBundler } = require('@payloadcms/bundler-webpack');
const { slateEditor } = require('@payloadcms/richtext-slate');
const path = require('path');

// Import collections
const Sites = require('./collections/Sites.ts');
const BlogPosts = require('./collections/BlogPosts.ts');
const SocialPosts = require('./collections/SocialPosts.ts');
const BioCards = require('./collections/BioCards.ts');
const Quotes = require('./collections/Quotes.ts');
const Media = require('./collections/Media.ts');

// Import css
require('./styles/globals.css');

module.exports = buildConfig({
  // Add serverURL for proper URL generation in production
  serverURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Configure CORS for security
  cors: {
    origins: process.env.NODE_ENV === 'production' 
      ? [process.env.NEXT_PUBLIC_API_URL, 'https://5-7-25-selfcast-cms.vercel.app'] 
      : ['http://localhost:3000'],
    headers: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
  },
  
  // Set cookie prefix for better security
  cookiePrefix: 'selfcast_cms',
  
  // Configure admin panel
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    css: path.resolve(__dirname, 'styles/globals.css'),
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
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Limit connections for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    },
    // Explicitly enable transactions for data integrity
    transactionOptions: {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    },
  }),
  
  // Add security measures
  rateLimit: {
    window: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per window
  },
  maxDepth: 10, // Prevent excessive query depth
  
  // GraphQL configuration
  graphQL: {
    maxComplexity: 1000, // Limit GraphQL query complexity
    disablePlaygroundInProduction: true,
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  editor: slateEditor({}),
  collections: [
    // These will connect to our existing MongoDB collections
    Sites,
    BlogPosts,
    SocialPosts,
    BioCards,
    Quotes,
    Media,
    // Users collection for authentication
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
});
