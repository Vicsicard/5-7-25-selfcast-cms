import { CollectionConfig } from 'payload/types';

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Admin can access all blog posts
    read: ({ req }) => {
      // Admin can read all blog posts
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Regular users can only read their own blog posts
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        };
      }
      
      // Public can read published blog posts
      return {
        status: {
          equals: 'published'
        }
      };
    },
    // Only users can update their own blog posts, admin can update all
    update: ({ req }) => {
      // Admin can update all blog posts
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Regular users can only update their own blog posts
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        };
      }
      
      // Public can update nothing
      return false;
    },
    // Only admin can delete blog posts
    delete: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin');
    },
    // Users can create their own blog posts, admin can create for any user
    create: ({ req }) => {
      return Boolean(req.user);
    },
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
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => {
          // Only admins can see and change the user field
          // For regular users, this will be automatically set to their own ID
          return user?.role === 'admin';
        },
      },
      // Default to current user if not explicitly set
      hooks: {
        beforeValidate: [
          ({ req, value }) => {
            if (!value && req.user) {
              return req.user.id;
            }
            return value;
          }
        ]
      }
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Health', value: 'health' },
        { label: 'Business', value: 'business' },
        { label: 'Lifestyle', value: 'lifestyle' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Travel', value: 'travel' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        components: {
          RowLabel: ({ data }) => {
            return data?.tag || 'Tag';
          },
        },
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the blog post',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Custom SEO title (defaults to post title if empty)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Custom SEO description',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Ensure the user field is set to the current user if not specifically set by an admin
        if (!data.user && req.user) {
          data.user = req.user.id;
        }
        
        return data;
      },
    ],
  },
};

export default BlogPosts;
