import { CollectionConfig } from 'payload/types';

const Quotes: CollectionConfig = {
  slug: 'quotes',
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['text', 'author', 'source'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Book, article, speech, etc.'
      }
    },
    {
      name: 'year',
      type: 'number',
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
      name: 'displayOptions',
      type: 'group',
      fields: [
        {
          name: 'style',
          type: 'select',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Highlight', value: 'highlight' },
            { label: 'Featured', value: 'featured' },
            { label: 'Minimal', value: 'minimal' },
          ],
          defaultValue: 'standard'
        },
        {
          name: 'fontSize',
          type: 'select',
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
          defaultValue: 'medium'
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
      defaultValue: 'published',
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

export default Quotes;
