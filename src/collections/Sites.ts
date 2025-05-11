import { CollectionConfig } from 'payload/types';
import React from 'react';

const Sites: CollectionConfig = {
  slug: 'sites',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectId', 'profile.fullName', 'createdAt'],
    group: 'Content',
    // Customize the admin UI for a better client experience
    description: 'Manage your website content by page and section',
  },
  access: {
    read: ({ req }) => {
      // Admin can read all sites
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Regular users can only read their own sites
      if (req.user) {
        return {
          user: {
            equals: req.user.id,
          },
        };
      }
      
      // Public can read nothing
      return false;
    },
    update: ({ req }) => {
      // Admin can update all sites
      if (req.user && req.user.role === 'admin') {
        return true;
      }
      
      // Regular users can only update their own sites
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
    delete: ({ req }) => {
      // Only admin can delete sites
      return Boolean(req.user && req.user.role === 'admin');
    },
    create: ({ req }) => {
      // Only admin can create sites
      return Boolean(req.user && req.user.role === 'admin');
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => {
          // If the current user is not an admin, make this read-only
          return user?.role !== 'admin';
        },
      },
    },
    {
      name: 'projectId',
      type: 'text',
      required: true,
      admin: {
        description: 'Unique project identifier from the original system'
      }
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
    },
    {
      name: 'branding',
      type: 'group',
      admin: {
        description: 'Customize your brand identity',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Your site logo (recommended size: 200x80px)'
          }
        },
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#0047AB',
          admin: {
            description: 'Primary brand color in hex format (e.g. #0047AB)'
          }
        },
        {
          name: 'copyrightText',
          type: 'text',
          defaultValue: 'Â© Copyright',
          admin: {
            description: 'Text to appear before the year in footer copyright'
          }
        }
      ]
    },
    {
      name: 'profile',
      type: 'group',
      fields: [
        {
          name: 'fullName',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'jobTitle',
          type: 'text',
        },
        {
          name: 'bio',
          type: 'textarea',
        },
        {
          name: 'avatar',
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
                { label: 'Other', value: 'other' }
              ]
            },
            {
              name: 'url',
              type: 'text'
            }
          ]
        }
      ]
    },
    // Homepage Sections - Organized by visual sections for easier editing
    {
      name: 'homepage',
      type: 'group',
      admin: {
        description: 'Manage all content sections that appear on your homepage',
      },
      fields: [
        // Hero Section
        {
          name: 'heroSection',
          type: 'group',
          admin: {
            description: 'The main banner section at the top of your homepage',
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide the entire hero section',
                position: 'sidebar',
              },
            },
            {
              name: 'headline',
              type: 'text',
              admin: {
                description: 'Main headline displayed in the hero (if empty, site title will be used)',
              },
            },
            {
              name: 'tagline',
              type: 'textarea',
              admin: {
                description: 'Subtitle or tagline shown below the headline',
              },
            },
            {
              name: 'profileImage',
              type: 'relationship',
              relationTo: 'media',
              admin: {
                description: 'Profile photo to display in the hero section',
              },
            },
            {
              name: 'ctaButton',
              type: 'group',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  defaultValue: 'Learn More',
                },
                {
                  name: 'link',
                  type: 'text',
                  defaultValue: '/about',
                },
              ],
            },
            {
              name: 'secondaryButton',
              type: 'group',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  defaultValue: 'Get in Touch',
                },
                {
                  name: 'link',
                  type: 'text',
                  defaultValue: '/contact',
                },
              ],
            },
          ],
        },
        
        // About Section with Quote Cards
        {
          name: 'aboutSection',
          type: 'group',
          admin: {
            description: 'The "About" section featuring quote cards',
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide the entire about section',
                position: 'sidebar',
              },
            },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'About',
            },
            {
              name: 'subheading',
              type: 'text',
              defaultValue: 'Personal insights and reflections',
            },
            {
              name: 'quoteCard1',
              type: 'group',
              admin: {
                description: 'First quote card in the About section',
              },
              fields: [
                {
                  name: 'visible',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Show or hide this card',
                  },
                },
                {
                  name: 'content',
                  type: 'textarea',
                  admin: {
                    description: 'The quote text',
                  },
                },
                {
                  name: 'author',
                  type: 'text',
                  admin: {
                    description: 'Attribution for the quote (your name or source)',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'Person', value: 'person' },
                    { label: 'Lightbulb', value: 'lightbulb' },
                    { label: 'Briefcase', value: 'briefcase' },
                    { label: 'Star', value: 'star' },
                  ],
                  defaultValue: 'person',
                },
              ],
            },
            {
              name: 'quoteCard2',
              type: 'group',
              admin: {
                description: 'Second quote card in the About section',
              },
              fields: [
                {
                  name: 'visible',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Show or hide this card',
                  },
                },
                {
                  name: 'content',
                  type: 'textarea',
                  admin: {
                    description: 'The quote text',
                  },
                },
                {
                  name: 'author',
                  type: 'text',
                  admin: {
                    description: 'Attribution for the quote (your name or source)',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'Person', value: 'person' },
                    { label: 'Lightbulb', value: 'lightbulb' },
                    { label: 'Briefcase', value: 'briefcase' },
                    { label: 'Star', value: 'star' },
                  ],
                  defaultValue: 'lightbulb',
                },
              ],
            },
            {
              name: 'quoteCard3',
              type: 'group',
              admin: {
                description: 'Third quote card in the About section',
              },
              fields: [
                {
                  name: 'visible',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Show or hide this card',
                  },
                },
                {
                  name: 'content',
                  type: 'textarea',
                  admin: {
                    description: 'The quote text',
                  },
                },
                {
                  name: 'author',
                  type: 'text',
                  admin: {
                    description: 'Attribution for the quote (your name or source)',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  options: [
                    { label: 'Person', value: 'person' },
                    { label: 'Lightbulb', value: 'lightbulb' },
                    { label: 'Briefcase', value: 'briefcase' },
                    { label: 'Star', value: 'star' },
                  ],
                  defaultValue: 'briefcase',
                },
              ],
            },
          ],
        },
        
        // Banner 1
        {
          name: 'banner1',
          type: 'group',
          admin: {
            description: 'First banner section (between About and Blog Posts)',
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide this banner',
                position: 'sidebar',
              },
            },
            {
              name: 'bannerImage',
              type: 'relationship',
              relationTo: 'media',
              admin: {
                description: 'Background image for this banner',
              },
            },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'My Creative Journey',
              admin: {
                description: 'Main heading for this banner',
              },
            },
            {
              name: 'caption',
              type: 'text',
              admin: {
                description: 'Subtext shown below the title',
              },
            },
          ],
        },
        
        // Blog Posts Section
        {
          name: 'blogPostsSection',
          type: 'group',
          admin: {
            description: 'The section displaying featured blog posts',
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide the entire blog posts section',
                position: 'sidebar',
              },
            },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Latest Posts',
            },
            {
              name: 'subheading',
              type: 'text',
              defaultValue: 'Insights and updates from our studio',
            },
            {
              name: 'showFeaturedOnly',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Only show posts marked as "featured" (otherwise shows most recent)',
              },
            },
            {
              name: 'postsToShow',
              type: 'number',
              defaultValue: 3,
              admin: {
                description: 'Number of posts to display in this section',
              },
            },
          ],
        },
        
        // Banner 2
        {
          name: 'banner2',
          type: 'group',
          admin: {
            description: 'Second banner section (between Blog Posts and Social Media)',
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide this banner',
                position: 'sidebar',
              },
            },
            {
              name: 'bannerImage',
              type: 'relationship',
              relationTo: 'media',
              admin: {
                description: 'Background image for this banner',
              },
            },
            {
              name: 'title',
              type: 'text',
              defaultValue: "Let's Connect",
              admin: {
                description: 'Main heading for this banner',
              },
            },
            {
              name: 'caption',
              type: 'text',
              admin: {
                description: 'Subtext shown below the title',
              },
            },
          ],
        },
        
        // Social Media Section
        {
          name: 'socialMediaSection',
          type: 'group',
          admin: {
            description: 'The section displaying social media content',
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide the entire social media section',
                position: 'sidebar',
              },
            },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Social Media',
            },
            {
              name: 'subheading',
              type: 'text',
              defaultValue: 'Connect with me across platforms',
            },
            {
              name: 'platformsToShow',
              type: 'select',
              hasMany: true,
              defaultValue: ['linkedin', 'instagram', 'facebook', 'twitter'],
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Twitter', value: 'twitter' },
              ],
              admin: {
                description: 'Select which social platforms to display',
              },
            },
          ],
        },
      ],
    },
    
    // About page structure
    {
      name: 'about',
      type: 'group',
      admin: {
        description: 'Manage content for your About page',
        className: 'about-page-group',
      },
      fields: [
        // Page Header
        {
          name: 'title',
          type: 'text',
          defaultValue: 'About Me',
          admin: {
            description: 'Main page title at the top of the About page'
          }
        },
        {
          name: 'subtitle',
          type: 'text',
          defaultValue: 'Professional podcast and media production services',
          admin: {
            description: 'Subtitle shown below the main page title'
          }
        },
        
        // Profile Section
        {
          name: 'profileImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Profile or company image shown on the left side of the About page'
          }
        },
        
        // About Content
        {
          name: 'contentSubheading',
          type: 'text',
          defaultValue: 'About Self Cast Studios',
          admin: {
            description: 'Subheading for the main content section'
          }
        },
        {
          name: 'content',
          type: 'richText',
          admin: {
            description: 'Main paragraph about you or your company'
          }
        },
        
        // Contact Information
        {
          name: 'contactHeading',
          type: 'text',
          defaultValue: 'Contact Information',
          admin: {
            description: 'Heading for the contact information section'
          }
        },
        {
          name: 'contact',
          type: 'group',
          admin: {
            description: 'Contact details shown in the sidebar'
          },
          fields: [
            {
              name: 'businessName',
              type: 'text',
              admin: {
                description: 'Your name or company name'
              }
            },
            {
              name: 'email',
              type: 'email',
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
              name: 'location',
              type: 'text',
              admin: {
                description: 'Physical location or address'
              }
            }
          ]
        }
      ]
    },
    
    // Blog page structure
    {
      name: 'blog',
      type: 'group',
      admin: {
        description: 'Manage content for your Blog page',
        className: 'blog-page-group',
      },
      fields: [
        // Page Header
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Blog',
          admin: {
            description: 'Main page title at the top of the Blog page'
          }
        },
        {
          name: 'description',
          type: 'text',
          defaultValue: 'Explore thoughts, ideas, and insights on a variety of topics.',
          admin: {
            description: 'Description text shown below the main title'
          }
        },
        
        // Search Functionality
        {
          name: 'showSearch',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show or hide the search bar on the blog page'
          }
        },
        
        // Featured Post Section
        {
          name: 'featuredPost',
          type: 'group',
          admin: {
            description: 'Settings for the featured post at the top of the blog page'
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide the featured post section'
              }
            },
            {
              name: 'selectionType',
              type: 'select',
              defaultValue: 'recent',
              options: [
                {
                  label: 'Most Recent Post',
                  value: 'recent',
                },
                {
                  label: 'Manually Selected Post',
                  value: 'manual',
                },
              ],
              admin: {
                description: 'How to select which post is featured'
              }
            },
            {
              name: 'postId',
              type: 'relationship',
              relationTo: 'blog-posts',
              admin: {
                description: 'Select a specific post to feature',
                condition: (data, siblingData) => siblingData?.selectionType === 'manual',
              }
            }
          ]
        },
        
        // Blog List Section
        {
          name: 'postsPerPage',
          type: 'number',
          defaultValue: 6,
          admin: {
            description: 'Number of posts to display per page'
          }
        },
        {
          name: 'gridLayout',
          type: 'select',
          defaultValue: 'grid-3',
          options: [
            {
              label: '2 Columns',
              value: 'grid-2',
            },
            {
              label: '3 Columns',
              value: 'grid-3',
            },
            {
              label: 'List View',
              value: 'list',
            },
          ],
          admin: {
            description: 'Layout style for the blog posts grid'
          }
        },
        
        // Pagination
        {
          name: 'showPagination',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show or hide the pagination controls'
          }
        }
      ]
    },
    
    // Projects page structure
    {
      name: 'projects',
      type: 'group',
      admin: {
        description: 'Manage content for your Projects page',
        className: 'projects-page-group',
      },
      fields: [
        // Page Header
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Our Projects',
          admin: {
            description: 'Main page title at the top of the Projects page'
          }
        },
        {
          name: 'navLabel',
          type: 'text',
          defaultValue: 'Projects',
          admin: {
            description: 'Custom label used in the navigation menu (default: "Projects")'
          }
        },
        {
          name: 'description',
          type: 'text',
          defaultValue: 'Explore our featured projects and client work. We take pride in delivering high-quality media productions.',
          admin: {
            description: 'Description text shown below the main title'
          }
        },
        
        // Filter Navigation
        {
          name: 'showCategories',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show or hide category filters on the projects page'
          }
        },
        
        // Projects Grid
        {
          name: 'gridLayout',
          type: 'select',
          defaultValue: 'grid-3',
          options: [
            {
              label: '2 Columns',
              value: 'grid-2',
            },
            {
              label: '3 Columns',
              value: 'grid-3',
            },
            {
              label: 'List View',
              value: 'list',
            },
          ],
          admin: {
            description: 'Layout style for the projects grid'
          }
        },
        {
          name: 'cardStyle',
          type: 'select',
          defaultValue: 'standard',
          options: [
            {
              label: 'Standard',
              value: 'standard',
            },
            {
              label: 'Minimal',
              value: 'minimal',
            },
            {
              label: 'Featured',
              value: 'featured',
            },
          ],
          admin: {
            description: 'Visual style for project cards'
          }
        },
        {
          name: 'projectsPerPage',
          type: 'number',
          defaultValue: 9,
          admin: {
            description: 'Number of projects to display per page'
          }
        },
        
        // Featured Projects Section
        {
          name: 'featuredProjects',
          type: 'group',
          admin: {
            description: 'Settings for the featured projects section at the top of the page'
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show or hide the featured projects section'
              }
            },
            {
              name: 'heading',
              type: 'text',
              defaultValue: 'Featured Projects',
              admin: {
                description: 'Heading for the featured projects section',
                condition: (data, siblingData) => siblingData?.visible === true,
              }
            },
            {
              name: 'projectIds',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              maxRows: 3,
              admin: {
                description: 'Select projects to feature (max 3)',
                condition: (data, siblingData) => siblingData?.visible === true,
              }
            }
          ]
        },
        
        // Call to Action Section
        {
          name: 'showCTA',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show or hide call-to-action section at the bottom of the page'
          }
        },
        {
          name: 'ctaHeading',
          type: 'text',
          defaultValue: 'Ready to Start Your Project?',
          admin: {
            description: 'Heading for the call-to-action section',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        },
        {
          name: 'ctaText',
          type: 'textarea',
          defaultValue: 'Get in touch with us to discuss your project needs and how we can help bring your vision to life.',
          admin: {
            description: 'Text content for the call-to-action',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        },
        {
          name: 'ctaButtonText',
          type: 'text',
          defaultValue: 'Contact Us',
          admin: {
            description: 'Text for the call-to-action button',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        },
        {
          name: 'ctaButtonURL',
          type: 'text',
          defaultValue: '/contact',
          admin: {
            description: 'URL for the call-to-action button',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        }
      ]
    },
    
    // Social Media Hub structure
    {
      name: 'social',
      type: 'group',
      admin: {
        description: 'Manage content for your Social Media Hub',
        className: 'social-media-hub-group',
      },
      fields: [
        // Main Page Header
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Social Media Hub',
          admin: {
            description: 'Main page title at the top of the Social Media Hub page'
          }
        },
        {
          name: 'navLabel',
          type: 'text',
          defaultValue: 'Social',
          admin: {
            description: 'Custom label shown in the navigation menu (default: "Social")'
          }
        },
        {
          name: 'description',
          type: 'text',
          defaultValue: 'Connect with me and see my latest updates across social media platforms.',
          admin: {
            description: 'Description text shown below the main title'
          }
        },
        
        // Platform Cards Configuration
        {
          name: 'cardStyle',
          type: 'select',
          defaultValue: 'standard',
          options: [
            {
              label: 'Standard',
              value: 'standard',
            },
            {
              label: 'Minimal',
              value: 'minimal',
            },
            {
              label: 'Bordered',
              value: 'bordered',
            },
          ],
          admin: {
            description: 'Visual style for platform cards'
          }
        },

        // Platform Card Visibility
        {
          name: 'linkedInCard',
          type: 'group',
          admin: {
            description: 'LinkedIn card settings'
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide LinkedIn card'
              }
            }
          ]
        },
        {
          name: 'twitterCard',
          type: 'group',
          admin: {
            description: 'Twitter card settings'
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide Twitter card'
              }
            }
          ]
        },
        {
          name: 'instagramCard',
          type: 'group',
          admin: {
            description: 'Instagram card settings'
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide Instagram card'
              }
            }
          ]
        },
        {
          name: 'facebookCard',
          type: 'group',
          admin: {
            description: 'Facebook card settings'
          },
          fields: [
            {
              name: 'visible',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show or hide Facebook card'
              }
            }
          ]
        },
        
        // Platform Profile Links
        {
          name: 'profiles',
          type: 'group',
          admin: {
            description: 'Your social media profile links'
          },
          fields: [
            {
              name: 'linkedin',
              type: 'text',
              admin: {
                description: 'Your LinkedIn profile URL'
              }
            },
            {
              name: 'twitter',
              type: 'text',
              admin: {
                description: 'Your Twitter profile URL'
              }
            },
            {
              name: 'instagram',
              type: 'text',
              admin: {
                description: 'Your Instagram profile URL'
              }
            },
            {
              name: 'facebook',
              type: 'text',
              admin: {
                description: 'Your Facebook profile URL'
              }
            }
          ]
        },
        
        // Platform Specific Pages
        {
          name: 'linkedin',
          type: 'group',
          admin: {
            description: 'LinkedIn platform page settings'
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'My LinkedIn Posts',
              admin: {
                description: 'Title for the LinkedIn platform page'
              }
            },
            {
              name: 'followButtonText',
              type: 'text',
              defaultValue: 'Connect with me on LinkedIn',
              admin: {
                description: 'Text for LinkedIn follow button'
              }
            }
          ]
        },
        {
          name: 'twitter',
          type: 'group',
          admin: {
            description: 'Twitter platform page settings'
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'My Twitter Feed',
              admin: {
                description: 'Title for the Twitter platform page'
              }
            },
            {
              name: 'followButtonText',
              type: 'text',
              defaultValue: 'Follow me on Twitter',
              admin: {
                description: 'Text for Twitter follow button'
              }
            }
          ]
        },
        {
          name: 'instagram',
          type: 'group',
          admin: {
            description: 'Instagram platform page settings'
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'My Instagram Feed',
              admin: {
                description: 'Title for the Instagram platform page'
              }
            },
            {
              name: 'followButtonText',
              type: 'text',
              defaultValue: 'Follow me on Instagram',
              admin: {
                description: 'Text for Instagram follow button'
              }
            }
          ]
        },
        {
          name: 'facebook',
          type: 'group',
          admin: {
            description: 'Facebook platform page settings'
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'My Facebook Posts',
              admin: {
                description: 'Title for the Facebook platform page'
              }
            },
            {
              name: 'followButtonText',
              type: 'text',
              defaultValue: 'Follow me on Facebook',
              admin: {
                description: 'Text for Facebook follow button'
              }
            }
          ]
        },
        
        // Posts Grid Settings
        {
          name: 'postsPerPage',
          type: 'number',
          defaultValue: 3,
          admin: {
            description: 'Number of posts to show in recent posts grid'
          }
        },
        {
          name: 'showPagination',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show or hide pagination controls'
          }
        },
        
        // Call to Action Section
        {
          name: 'showCTA',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show or hide call-to-action section at the bottom of the page'
          }
        },
        {
          name: 'ctaHeading',
          type: 'text',
          defaultValue: 'Let\'s Connect!',
          admin: {
            description: 'Heading for the call-to-action section',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        },
        {
          name: 'ctaText',
          type: 'textarea',
          defaultValue: 'Follow me on social media to stay up to date with my latest content and updates.',
          admin: {
            description: 'Text content for the call-to-action',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        },
        {
          name: 'ctaButtonText',
          type: 'text',
          defaultValue: 'View All Profiles',
          admin: {
            description: 'Text for the call-to-action button',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        },
        {
          name: 'ctaButtonURL',
          type: 'text',
          defaultValue: '#profiles',
          admin: {
            description: 'URL for the call-to-action button',
            condition: (data, siblingData) => siblingData?.showCTA === true,
          }
        }
      ]
    },
    
    // Site settings for template selection and deployment
    {
      name: 'siteSettings',
      type: 'group',
      admin: {
        description: 'Technical settings for your website',
      },
      fields: [
        {
          name: 'template',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Portfolio', value: 'portfolio' },
            { label: 'Business', value: 'business' },
            { label: 'Blog', value: 'blog' }
          ]
        },
        {
          name: 'customDomain',
          type: 'text',
          admin: {
            description: 'Custom domain if you have one (e.g. www.example.com)'
          }
        },
        {
          name: 'vercelProjectId',
          type: 'text',
          admin: {
            description: 'Vercel project ID for deployments (automatically set)'
          }
        },
        {
          name: 'lastDeployedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Time of last successful deployment'
          }
        },
        {
          name: 'autoDeployOnSave',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Automatically deploy site when saved'
          }
        },
        {
          name: 'seoSettings',
          type: 'group',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              admin: {
                description: 'Override the default page title'
              }
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              admin: {
                description: 'Brief description for search engines'
              }
            },
            {
              name: 'openGraphImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Image for social media sharing'
              }
            }
          ]
        }
      ]
    }
  ]
};

export default Sites;
