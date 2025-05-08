# Self Cast Studios CMS

This repository contains the Content Management System (CMS) for Self Cast Studios, providing a comprehensive admin interface for managing website content and API access to MongoDB data.

## Quick Start Guide

To start the CMS server:

```bash
cd C:\Users\digit\CascadeProjects\5-7-25-selfcast-cms
npm install
node cms-server.js
```

This will start the CMS on port 3000:
- Admin Dashboard: http://localhost:3000
- API Endpoints: http://localhost:3000/api
- Login: http://localhost:3000/login

## Project Structure

- `cms-server.js` - Main CMS server that connects to MongoDB and provides the admin interface
- `*-editor-route.js` - Route files for each page editor (home, about, blog, projects, social, contact, global)
- `public/` - Public assets and client-side JavaScript
  - `js/` - Client-side JavaScript for each editor
  - `uploads/` - Uploaded files (logos, images, etc.)
- `node_modules/` - Node.js dependencies

## Features

### Page Editors
- **Home Page Editor**: Customize homepage content
- **About Page Editor**: Manage about page content and profile information
- **Blog Editor**: Create and manage blog posts and blog page settings
- **Projects Editor**: Manage project portfolios and project page settings
- **Social Media Hub**: Manage social media content across platforms
- **Contact Page Editor**: Customize contact form and manage messages
- **Global Components Editor**: Site-wide branding, header, and footer customization

### API Endpoints

The following API endpoints are available:

- `/api/sites` - Site configuration and page system data
- `/api/global/*` - Global components settings (brand, header, footer)
- `/api/contact/*` - Contact page settings and form submissions
- `/api/messages` - Contact form submissions
- `/api/social/*` - Social media content and settings

## Database Connection

The CMS connects to MongoDB using the connection string stored in the `.env` file. This connection provides access to the following collections:

- `sites` - Contains website configuration including page content, settings, and global components
- `messages` - Stores contact form submissions

## Authentication

The CMS includes a simple authentication system with role-based access control:
- **Admin users**: Have full access to all features and can manage multiple clients
- **Regular users**: Have limited access based on their role

## Customization

The CMS allows clients to customize various aspects of their website:
- **Brand elements**: Logo, site title, tagline, primary color
- **Page content**: Text, images, and settings for each page
- **Navigation**: Custom labels and page visibility in the header
- **Footer**: Contact information, social links, and copyright text

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Frontend**: Vanilla JavaScript with HTML/CSS
- **File Uploads**: Multer for handling file uploads
  - Homepage settings
  - About page content
  - Social Media Hub configuration
  - Projects page layout
  - Blog page settings
- `blogposts` - Blog articles with content, categories, and metadata
- `socialposts` - Posts from different social platforms (LinkedIn, Twitter, Instagram, Facebook)
- `biocards` - Team member biographies
- `quotes` - Testimonial quotes
- `media` - Uploaded images and files

## Client Website

The Self Cast Studios client website is located at:
```
C:\Users\digit\CascadeProjects\5-7-25-selfcast-website\sites\selfcast-client-site
```

To start the client website:
```bash
cd C:\Users\digit\CascadeProjects\5-7-25-selfcast-website\sites\selfcast-client-site
npm run dev
```

The client website will run on port 7777: http://localhost:7777

## Troubleshooting

If you encounter issues:

1. Ensure MongoDB connection string is correct in the `.env` file
2. Check that ports 3001 (CMS) and 7777 (website) are available
3. Verify that all required dependencies are installed with `npm install`

## Future Development

For full Payload CMS admin interface with the complete page system:
1. Configure TypeScript compilation to convert TypeScript collection files to JavaScript
2. Update payload.config.js to use the compiled JavaScript files
3. Start the Payload CMS server with the compiled files
