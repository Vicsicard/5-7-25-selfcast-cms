import { CollectionConfig } from 'payload/types';

const BioCards: CollectionConfig = {
  slug: 'bio-cards',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title', 'status'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'GitHub', value: 'github' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Website', value: 'website' },
            { label: 'Other', value: 'other' }
          ]
        },
        {
          name: 'url',
          type: 'text',
          required: true
        }
      ]
    },
    {
      name: 'displayOptions',
      type: 'group',
      fields: [
        {
          name: 'layout',
          type: 'select',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Compact', value: 'compact' },
            { label: 'Featured', value: 'featured' }
          ],
          defaultValue: 'standard'
        },
        {
          name: 'showSocial',
          type: 'checkbox',
          defaultValue: true
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

export default BioCards;
