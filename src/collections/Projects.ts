import { CollectionConfig } from 'payload/types';

const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'createdAt'],
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
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'URL to the project (optional)'
      }
    },
    {
      name: 'categories',
      type: 'array',
      fields: [
        {
          name: 'category',
          type: 'text',
        }
      ]
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
