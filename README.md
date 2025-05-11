   # Self Cast Studios CMS

This repository contains the Content Management System (CMS) for Self Cast Studios, built with PayloadCMS, providing a comprehensive admin interface for managing website content and API access to MongoDB data.

## Quick Start Guide

To start the CMS server:

```bash
npm install
npm run dev
```

This will start the CMS on port 3000:
- Admin Dashboard: http://localhost:3000/admin
- API Endpoints: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

## Project Structure

- `src/` - Main PayloadCMS application
  - `server.js` - PayloadCMS server entry point
  - `payload.config.js` - PayloadCMS configuration
  - `collections/` - Collection definitions for MongoDB
- `public/` - Public assets and static files
  - `uploads/` - Uploaded files (logos, images, etc.)
- `vercel.json` - Vercel deployment configuration

## Deployment to Vercel

This project is configured for deployment on Vercel. The following environment variables must be set in your Vercel project:

- `MONGODB_URI` - MongoDB connection string
- `PAYLOAD_SECRET` - Secret key for JWT authentication
- `NEXT_PUBLIC_API_URL` - URL for the API (e.g., https://your-project.vercel.app/api)

### Deployment Steps

1. Push your changes to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the project

### Troubleshooting MongoDB Connection

If you encounter MongoDB connection issues in Vercel:

1. Ensure your MongoDB Atlas cluster allows connections from anywhere (IP: 0.0.0.0/0)
2. Verify the MongoDB connection string is correctly formatted
3. Check the health endpoint at `/api/health` for detailed diagnostics
4. Review Vercel logs for any connection errors

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
