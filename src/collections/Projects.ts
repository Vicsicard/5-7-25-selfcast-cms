import { CollectionConfig } from 'payload/types';

const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Project title'
      }
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'URL slug for the project (used in the project URL)'
      }
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short description of the project'
      }
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Detailed content about the project'
      }
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image for the project'
      }
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        description: 'Category tag for the project'
      }
    },
    {
      name: 'client',
      type: 'text',
      admin: {
        description: 'Client name for the project'
      }
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        description: 'Date when project was completed'
      }
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'External URL to view the project (if applicable)'
      }
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Flag to mark project as featured',
        position: 'sidebar'
      }
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' }
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'siteId',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      admin: {
        position: 'sidebar'
      }
    }
  ],
};

export default Projects;
