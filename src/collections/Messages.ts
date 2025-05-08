import { CollectionConfig } from 'payload/types';

const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'createdAt', 'read'],
    group: 'Content',
  },
  access: {
    // Only authenticated users can read messages
    read: ({ req }) => {
      return Boolean(req.user);
    },
    // Only authenticated users can update messages (mark as read, add notes)
    update: ({ req }) => {
      return Boolean(req.user);
    },
    // Only authenticated users can delete messages
    delete: ({ req }) => {
      return Boolean(req.user);
    },
    // Anyone can create messages (submit contact form)
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        readOnly: true, // Cannot edit submitted name
      }
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        readOnly: true,
      }
    },
    {
      name: 'phone',
      type: 'text',
      required: false,
      admin: {
        readOnly: true,
      }
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      }
    },
    {
      name: 'serviceInterest',
      type: 'select',
      required: false,
      options: [
        { label: 'Podcast Production', value: 'podcast' },
        { label: 'Audio Engineering', value: 'audio' },
        { label: 'Content Strategy', value: 'content' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        readOnly: true,
      }
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        readOnly: true,
      }
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as read after reviewing',
      }
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Private notes about this message',
      }
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt automatically
};

export default Messages;
