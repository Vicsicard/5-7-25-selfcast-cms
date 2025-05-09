import { buildConfig } from 'payload/config';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';

// Import only the Media collection for simplicity
import Media from './collections/Media';

// Import css
import './styles/globals.css';

export default buildConfig({
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
      maxPoolSize: 10, // Limit connections for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
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
  
  // Only include the Media collection for now
  collections: [
    Media,
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
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ],
          defaultValue: 'user',
          required: true,
        },
      ],
    }
  ],
});
