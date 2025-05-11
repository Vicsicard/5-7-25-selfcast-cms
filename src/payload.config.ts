import { buildConfig } from 'payload/config.js';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';

// Import collections
import Sites from './collections/Sites';
import BlogPosts from './collections/BlogPosts';
import SocialPosts from './collections/SocialPosts';
import BioCards from './collections/BioCards';
import Quotes from './collections/Quotes';
import Media from './collections/Media';
import Messages from './collections/Messages';
import Projects from './collections/Projects';
import GlobalComponents from './collections/GlobalComponents';

// Import custom components
import UserSelector from './components/UserSelector';

// CSS imports are handled by Payload's bundler
// We're removing direct CSS imports to avoid compilation issues

export default buildConfig({
  // Set the server URL to the Render deployment URL
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://selfcast-cms-admin.onrender.com',
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    css: path.resolve(__dirname, 'styles/globals.css'),
    meta: {
      titleSuffix: '- User Site CMS',
      ogImage: '/logo.png',
      favicon: '/favicon.ico',
    },
    components: {
      // Add the UserSelector component to the admin dashboard
      beforeDashboard: [UserSelector],
      // Add the UserSelector to the navigation as well
      beforeNavLinks: [UserSelector],
    },
    // We'll customize the admin UI with CSS overrides in a separate admin.scss file
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI,
  }),
  editor: slateEditor({}),
  collections: [
    // These will connect to our existing MongoDB collections
    Sites,
    BlogPosts,
    SocialPosts,
    BioCards,
    Quotes,
    Projects,
    GlobalComponents,
    Media,
    Messages,
    // Users collection for authentication
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
        group: 'Admin',
        defaultColumns: ['email', 'name', 'role', 'createdAt'],
        description: 'User accounts and their associated sites',
      },
      access: {
        // Only admins can read all users
        read: ({ req }) => {
          // Admins can read all
          if (req.user && req.user.role === 'admin') return true;
          
          // Users can read themselves
          if (req.user) return { id: { equals: req.user.id } };
          
          // No public access
          return false;
        },
        // Only admins can create users
        create: ({ req }) => {
          return Boolean(req.user && req.user.role === 'admin');
        },
        // Admins can update all, users can update themselves
        update: ({ req }) => {
          if (req.user && req.user.role === 'admin') return true;
          if (req.user) return { id: { equals: req.user.id } };
          return false;
        },
        // Only admins can delete
        delete: ({ req }) => {
          return Boolean(req.user && req.user.role === 'admin');
        },
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'User', value: 'user' },
          ],
          defaultValue: 'user',
          required: true,
          admin: {
            position: 'sidebar',
            condition: (data, siblingData, { user }) => {
              // If the current user is not an admin, make this read-only
              return user?.role !== 'admin';
            },
          }
        },
        {
          name: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
        },
        {
          name: 'accountStatus',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Pending', value: 'pending' },
            { label: 'Suspended', value: 'suspended' },
          ],
          defaultValue: 'active',
          admin: {
            position: 'sidebar',
            description: 'Current status of this user account',
          },
        },
        // Add a relationship to sites for quick access
        {
          name: 'userSite',
          type: 'relationship',
          relationTo: 'sites',
          hasMany: false,
          admin: {
            description: 'The site associated with this user',
            readOnly: true,
          },
        },
        // User stats and reference fields for admin
        {
          type: 'tabs',
          tabs: [
            {
              label: 'User Content',
              description: 'All content created by this user',
              fields: [
                {
                  name: 'blogPosts',
                  type: 'relationship',
                  relationTo: 'blog-posts',
                  hasMany: true,
                  admin: {
                    description: 'Blog posts created by this user',
                    readOnly: true,
                  },
                },
                {
                  name: 'socialPosts',
                  type: 'relationship',
                  relationTo: 'social-posts',
                  hasMany: true,
                  admin: {
                    description: 'Social posts created by this user',
                    readOnly: true,
                  },
                },
                {
                  name: 'bioCards',
                  type: 'relationship',
                  relationTo: 'bio-cards',
                  hasMany: true,
                  admin: {
                    description: 'Bio cards created by this user',
                    readOnly: true,
                  },
                },
                {
                  name: 'quotes',
                  type: 'relationship',
                  relationTo: 'quotes',
                  hasMany: true,
                  admin: {
                    description: 'Quotes created by this user',
                    readOnly: true,
                  },
                },
              ],
            },
            {
              label: 'User Stats',
              description: 'Statistics about this user account',
              fields: [
                {
                  name: 'contentCount',
                  type: 'group',
                  admin: {
                    readOnly: true,
                  },
                  fields: [
                    {
                      name: 'totalPosts',
                      type: 'number',
                      admin: {
                        description: 'Total number of content items',
                      },
                    },
                    {
                      name: 'lastUpdated',
                      type: 'date',
                      admin: {
                        description: 'Last time content was updated',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      hooks: {
        // When an admin creates a user, also create a site for them
        afterChange: [
          async ({ req, operation, doc, collection }) => {
            // Only run if we're creating a user and we're an admin
            if (operation === 'create' && req.user?.role === 'admin' && doc.role === 'user') {
              // Create a site for the new user
              try {
                const siteName = doc.name || doc.email.split('@')[0];
                // Access the payload instance from req
                const site = await req.payload.create({
                  collection: 'sites',
                  data: {
                    title: `${siteName}'s Site`,
                    projectId: `site-${doc.id}`,
                    user: doc.id,
                    status: 'draft',
                  },
                });
                
                // Update the user with the site reference
                await req.payload.update({
                  collection: 'users',
                  id: doc.id,
                  data: {
                    userSite: site.id,
                  },
                });
              } catch (error) {
                console.error('Error creating site for new user:', error);
              }
            }
            
            return doc;
          },
        ],
        // Before sending user data to the admin panel, gather related content stats
        beforeRead: [
          async ({ req, doc }) => {
            // Only do this for admin users to avoid unnecessary processing for regular users
            if (req.user?.role === 'admin' && doc) {
              try {
                // Get counts of user content
                const blogPosts = await req.payload.find({
                  collection: 'blog-posts',
                  where: {
                    user: {
                      equals: doc.id,
                    },
                  },
                });
                
                const socialPosts = await req.payload.find({
                  collection: 'social-posts',
                  where: {
                    user: {
                      equals: doc.id,
                    },
                  },
                });
                
                const bioCards = await req.payload.find({
                  collection: 'bio-cards',
                  where: {
                    user: {
                      equals: doc.id,
                    },
                  },
                });
                
                const quotes = await req.payload.find({
                  collection: 'quotes',
                  where: {
                    user: {
                      equals: doc.id,
                    },
                  },
                });
                
                // Update content relationships and stats
                doc.blogPosts = blogPosts.docs.map(post => post.id);
                doc.socialPosts = socialPosts.docs.map(post => post.id);
                doc.bioCards = bioCards.docs.map(card => card.id);
                doc.quotes = quotes.docs.map(quote => quote.id);
                
                // Calculate totals
                const totalPosts = 
                  blogPosts.totalDocs + 
                  socialPosts.totalDocs + 
                  bioCards.totalDocs + 
                  quotes.totalDocs;
                
                // Get the most recent update timestamp
                const allDates = [
                  ...blogPosts.docs.map(post => new Date(String(post.updatedAt || post.createdAt))),
                  ...socialPosts.docs.map(post => new Date(String(post.updatedAt || post.createdAt))),
                  ...bioCards.docs.map(card => new Date(String(card.updatedAt || card.createdAt))),
                  ...quotes.docs.map(quote => new Date(String(quote.updatedAt || quote.createdAt))),
                ].filter(date => date instanceof Date && !isNaN(date.getTime()));
                
                const lastUpdated = allDates.length ? 
                  new Date(Math.max(...allDates.map(date => date.getTime()))) : 
                  null;
                
                // Update stats
                doc.contentCount = {
                  totalPosts,
                  lastUpdated,
                };
              } catch (error) {
                console.error('Error gathering user content stats:', error);
              }
            }
            
            return doc;
          }
        ]
      },
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  // Add a global listener to customize the admin UI for regular users
  onInit: async (payload) => {
    // This runs when the server initializes - we'll use this for logging only
    payload.logger.info('Payload CMS initialized with custom user access control');
  },
});
