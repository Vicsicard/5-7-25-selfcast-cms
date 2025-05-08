const { buildConfig } = require('payload/config');
const { mongooseAdapter } = require('@payloadcms/db-mongodb');
const { webpackBundler } = require('@payloadcms/bundler-webpack');
const { slateEditor } = require('@payloadcms/richtext-slate');
const path = require('path');

// Import collections
const Sites = require('./collections/Sites');
const BlogPosts = require('./collections/BlogPosts');
const SocialPosts = require('./collections/SocialPosts');
const BioCards = require('./collections/BioCards');
const Quotes = require('./collections/Quotes');
const Media = require('./collections/Media');

// Import css
require('./styles/globals.css');

module.exports = buildConfig({
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    css: path.resolve(__dirname, 'styles/globals.css'),
    meta: {
      titleSuffix: '- One To Rule Them All CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
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
