import { CollectionConfig } from 'payload/types';

const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['platform', 'status', 'publishDate', 'user'],
    group: 'Content',
  },
  access: {
    // Admin can access all social posts
    read: ({ req }) => {
      // Admin can read all social posts
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Regular users can only read their own social posts
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        };
      }
      
      // Public can read published social posts
      return {
        status: {
          equals: 'published'
        }
      };
    },
    // Only users can update their own social posts, admin can update all
    update: ({ req }) => {
      // Admin can update all social posts
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Regular users can only update their own social posts
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
    // Only admin can delete social posts
    delete: ({ req }) => {
      return Boolean(req.user && req.user.role === 'admin');
    },
    // Users can create their own social posts, admin can create for any user
    create: ({ req }) => {
      return Boolean(req.user);
    },
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
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
      name: 'platform',
      type: 'select',
      options: [
        { label: 'Twitter', value: 'twitter' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'YouTube', value: 'youtube' },
      ],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
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
        description: 'When to publish this post',
      },
    },
    {
      name: 'media',
      type: 'array',
      fields: [
        {
          name: 'mediaItem',
          type: 'upload',
          relationTo: 'media',
        }
      ],
      admin: {
        description: 'Images or videos to attach to the post',
      },
    },
    {
      name: 'hashtags',
      type: 'array',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
        }
      ],
      admin: {
        components: {
          RowLabel: ({ data }) => {
            return data?.hashtag || 'Hashtag';
          },
        },
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Optional link to include in the post',
      },
    },
    {
      name: 'siteId',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        }
      ]
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

export default SocialPosts;
