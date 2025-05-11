import { CollectionConfig } from 'payload/types';

const GlobalComponents: CollectionConfig = {
  slug: 'global-components',
  admin: {
    useAsTitle: 'siteId',
    defaultColumns: ['siteId', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteId',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Site this global configuration belongs to'
      }
    },
    // Brand Elements Section
    {
      name: 'brandElements',
      type: 'group',
      admin: {
        description: 'Brand elements for the site',
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Site logo image (customizable)'
          }
        },
        {
          name: 'siteTitle',
          type: 'text',
          defaultValue: 'Self Cast Studios',
          admin: {
            description: 'Site title (customizable)'
          }
        },
        {
          name: 'tagline',
          type: 'text',
          admin: {
            description: 'Site description/tagline (customizable)'
          }
        },
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#0047AB',
          admin: {
            description: 'Primary brand color - hex code (customizable)'
          }
        },
        {
          name: 'contactInfo',
          type: 'group',
          admin: {
            description: 'Contact information (customizable)'
          },
          fields: [
            {
              name: 'email',
              type: 'text',
              admin: {
                description: 'Contact email address'
              }
            },
            {
              name: 'phone',
              type: 'text',
              admin: {
                description: 'Contact phone number'
              }
            },
            {
              name: 'address',
              type: 'textarea',
              admin: {
                description: 'Physical address'
              }
            }
          ]
        },
        {
          name: 'socialMediaLinks',
          type: 'group',
          admin: {
            description: 'Social media platform URLs (customizable)'
          },
          fields: [
            {
              name: 'facebook',
              type: 'text',
              admin: {
                description: 'Facebook URL'
              }
            },
            {
              name: 'twitter',
              type: 'text',
              admin: {
                description: 'Twitter URL'
              }
            },
            {
              name: 'instagram',
              type: 'text',
              admin: {
                description: 'Instagram URL'
              }
            },
            {
              name: 'linkedin',
              type: 'text',
              admin: {
                description: 'LinkedIn URL'
              }
            },
            {
              name: 'youtube',
              type: 'text',
              admin: {
                description: 'YouTube URL'
              }
            }
          ]
        }
      ]
    },
    // Header Components Section
    {
      name: 'headerComponents',
      type: 'group',
      admin: {
        description: 'Header components for the site',
      },
      fields: [
        {
          name: 'useLogo',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display site logo in header (links to homepage)'
          }
        },
        {
          name: 'displaySiteTitle',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display site title in header'
          }
        },
        {
          name: 'navigation',
          type: 'group',
          admin: {
            description: 'Main navigation settings'
          },
          fields: [
            {
              name: 'showHome',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Home in navigation'
              }
            },
            {
              name: 'homeLabel',
              type: 'text',
              defaultValue: 'Home',
              admin: {
                description: 'Custom label for Home navigation item',
                condition: (data, siblingData) => siblingData?.showHome === true
              }
            },
            {
              name: 'showAbout',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show About in navigation'
              }
            },
            {
              name: 'aboutLabel',
              type: 'text',
              defaultValue: 'About',
              admin: {
                description: 'Custom label for About navigation item',
                condition: (data, siblingData) => siblingData?.showAbout === true
              }
            },
            {
              name: 'showBlog',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Blog in navigation'
              }
            },
            {
              name: 'blogLabel',
              type: 'text',
              defaultValue: 'Blog',
              admin: {
                description: 'Custom label for Blog navigation item',
                condition: (data, siblingData) => siblingData?.showBlog === true
              }
            },
            {
              name: 'showProjects',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Projects in navigation'
              }
            },
            {
              name: 'projectsLabel',
              type: 'text',
              defaultValue: 'Projects',
              admin: {
                description: 'Custom label for Projects navigation item',
                condition: (data, siblingData) => siblingData?.showProjects === true
              }
            },
            {
              name: 'showSocial',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Social in navigation'
              }
            },
            {
              name: 'socialLabel',
              type: 'text',
              defaultValue: 'Social',
              admin: {
                description: 'Custom label for Social navigation item',
                condition: (data, siblingData) => siblingData?.showSocial === true
              }
            },
            {
              name: 'showContact',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Contact in navigation'
              }
            },
            {
              name: 'contactLabel',
              type: 'text',
              defaultValue: 'Contact',
              admin: {
                description: 'Custom label for Contact navigation item',
                condition: (data, siblingData) => siblingData?.showContact === true
              }
            }
          ]
        }
      ]
    },
    // Footer Components Section
    {
      name: 'footerComponents',
      type: 'group',
      admin: {
        description: 'Footer components for the site',
      },
      fields: [
        {
          name: 'showContactInfo',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display contact information in footer'
          }
        },
        {
          name: 'showSocialIcons',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Display social media icons in footer'
          }
        },
        {
          name: 'footerLinks',
          type: 'group',
          admin: {
            description: 'Quick navigation links in footer'
          },
          fields: [
            {
              name: 'showHome',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Home link in footer'
              }
            },
            {
              name: 'showAbout',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show About link in footer'
              }
            },
            {
              name: 'showBlog',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Blog link in footer'
              }
            },
            {
              name: 'showProjects',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Projects link in footer'
              }
            },
            {
              name: 'showSocial',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Social link in footer'
              }
            },
            {
              name: 'showContact',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Contact link in footer'
              }
            },
            {
              name: 'showPrivacyPolicy',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Privacy Policy link in footer'
              }
            },
            {
              name: 'showTermsOfService',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show Terms of Service link in footer'
              }
            }
          ]
        },
        {
          name: 'copyrightText',
          type: 'text',
          defaultValue: '© Self Cast Studios',
          admin: {
            description: 'Copyright text prefix (year will be added automatically)'
          }
        }
      ]
    }
  ],
};

export default GlobalComponents;
