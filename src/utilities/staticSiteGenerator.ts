import payload from 'payload';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import axios from 'axios';
import sharp from 'sharp';

const execPromise = util.promisify(exec);

interface GenerateSiteOptions {
  projectId?: string;
  outputDir?: string;
  templateId?: string;
  optimize?: boolean;
}

/**
 * Utility for generating static sites from PayloadCMS content
 */
export const generateStaticSite = async (options: GenerateSiteOptions = {}) => {
  const { 
    projectId, 
    outputDir = path.resolve(__dirname, '../../static-output'),
    optimize = true
  } = options;
  
  try {
    // Log the start of site generation
    payload.logger.info(`Starting static site generation for project: ${projectId || 'all projects'}`);
    
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Find all the sites to generate
    let sites;
    if (projectId) {
      // Find a specific site by projectId
      const result = await payload.find({
        collection: 'sites',
        where: {
          projectId: {
            equals: projectId,
          },
        },
      });
      sites = result.docs;
    } else {
      // Find all sites
      const result = await payload.find({
        collection: 'sites',
        limit: 100,
      });
      sites = result.docs;
    }
    
    if (!sites || sites.length === 0) {
      payload.logger.warn(`No sites found for project ID: ${projectId || 'any project'}`);
      return {
        success: false,
        message: `No sites found for project ID: ${projectId || 'any project'}`,
      };
    }
    
    // Process each site
    const generatedSites = [];
    for (const site of sites) {
      payload.logger.info(`Generating site: ${site.title} (${site.projectId})`);
      
      // Create site directory
      const siteDir = path.join(outputDir, site.projectId);
      if (!fs.existsSync(siteDir)) {
        fs.mkdirSync(siteDir, { recursive: true });
      }
      
      // Fetch related content for this site
      const [blogPosts, socialPosts, bioCards, quotes, media] = await Promise.all([
        payload.find({
          collection: 'blog-posts',
          where: { projectId: { equals: site.projectId } },
          limit: 100,
        }),
        payload.find({
          collection: 'social-posts',
          where: { projectId: { equals: site.projectId } },
          limit: 100,
        }),
        payload.find({
          collection: 'bio-cards',
          where: { projectId: { equals: site.projectId } },
          limit: 100,
        }),
        payload.find({
          collection: 'quotes',
          where: { projectId: { equals: site.projectId } },
          limit: 100,
        }),
        payload.find({
          collection: 'media',
          where: { projectId: { equals: site.projectId } },
          limit: 100,
        }),
      ]);
      
      // Generate site data
      const siteData = {
        site,
        blogPosts: blogPosts.docs,
        socialPosts: socialPosts.docs,
        bioCards: bioCards.docs,
        quotes: quotes.docs,
        media: media.docs,
      };
      
      // Write the site data to a JSON file for Next.js to use
      fs.writeFileSync(
        path.join(siteDir, 'data.json'),
        JSON.stringify(siteData, null, 2)
      );
      
      // Copy media files and optimize if needed
      const mediaDir = path.join(siteDir, 'media');
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }
      
      // Process and copy media files
      await processSiteMedia(site.projectId, media.docs, mediaDir, optimize);
      
      // Generate sitemap.xml
      await generateSitemap(site, blogPosts.docs, siteDir);
      
      // Generate structured data (JSON-LD)
      await generateStructuredData(site, siteDir);
      
      // Apply template based on site settings or default template
      const templateId = site.siteSettings?.template || 'default';
      await applyTemplate(templateId, siteDir, siteData);
      
      payload.logger.info(`Site data generated for ${site.title} at ${siteDir}`);
      
      generatedSites.push({
        id: site.id,
        projectId: site.projectId,
        title: site.title,
        directory: siteDir
      });
    }
    
    // Build Next.js site if configured
    if (process.env.BUILD_NEXTJS === 'true') {
      payload.logger.info('Building Next.js site...');
      try {
        const nextjsDir = path.resolve(__dirname, '../../nextjs');
        const { stdout, stderr } = await execPromise('npm run build', { cwd: nextjsDir });
        payload.logger.info('Next.js build output:', stdout);
        if (stderr) {
          payload.logger.error('Next.js build errors:', stderr);
        }
      } catch (error) {
        payload.logger.error('Error building Next.js site:', error);
      }
    }
    
    return {
      success: true,
      message: `Successfully generated static site for ${sites.length} site(s)`,
      sitesGenerated: generatedSites,
    };
  } catch (error) {
    payload.logger.error('Error generating static site:', error);
    return {
      success: false,
      message: `Error generating static site: ${error.message}`,
    };
  }
};

/**
 * Process and optimize media files for a site
 */
async function processSiteMedia(projectId, mediaItems, outputDir, optimize) {
  for (const media of mediaItems) {
    try {
      if (!media.url) continue;
      
      const mediaUrl = media.url.startsWith('http') 
        ? media.url 
        : `${process.env.PAYLOAD_PUBLIC_SERVER_URL}${media.url}`;
      
      const filename = path.basename(media.url);
      const outputPath = path.join(outputDir, filename);
      
      // Download the file
      const response = await axios({
        method: 'GET',
        url: mediaUrl,
        responseType: 'arraybuffer',
      });
      
      const buffer = Buffer.from(response.data, 'binary');
      
      // Optimize images if enabled
      if (optimize && (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png'))) {
        await sharp(buffer)
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .toFile(outputPath);
          
        // Generate responsive versions
        const sizes = [1200, 800, 400];
        for (const size of sizes) {
          const resizedFilename = filename.replace(/\.(jpg|jpeg|png)$/, `-${size}.$1`);
          const resizedPath = path.join(outputDir, resizedFilename);
          
          await sharp(buffer)
            .resize(size, null, { fit: 'inside', withoutEnlargement: true })
            .toFile(resizedPath);
        }
      } else {
        // Just save the file as-is
        fs.writeFileSync(outputPath, buffer);
      }
    } catch (error) {
      payload.logger.error(`Error processing media ${media.id}:`, error);
    }
  }
}

/**
 * Generate a sitemap.xml file for the site
 */
async function generateSitemap(site, blogPosts, outputDir) {
  const hostname = site.siteSettings?.customDomain || `${site.projectId}.yoursite.com`;
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add homepage
  sitemap += `  <url>\n    <loc>https://${hostname}/</loc>\n    <priority>1.0</priority>\n  </url>\n`;
  
  // Add blog posts
  for (const post of blogPosts) {
    if (post.active) {
      const slug = post.slug || post.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      sitemap += `  <url>\n    <loc>https://${hostname}/blog/${slug}</loc>\n`;
      
      if (post.date) {
        sitemap += `    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>\n`;
      }
      
      sitemap += `    <priority>0.8</priority>\n  </url>\n`;
    }
  }
  
  sitemap += '</urlset>';
  
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
  payload.logger.info(`Generated sitemap.xml for ${site.title}`);
}

/**
 * Generate structured data (JSON-LD) for the site
 */
async function generateStructuredData(site, outputDir) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": site.title,
    "description": site.subtitle || "",
    "url": site.siteSettings?.customDomain 
      ? `https://${site.siteSettings.customDomain}/` 
      : `https://${site.projectId}.yoursite.com/`
  };
  
  if (site.profile && site.profile.fullName) {
    const personData: {
      "@context": string;
      "@type": string;
      name: string;
      description: string;
      image?: string;
    } = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": site.profile.fullName,
      "description": site.profile.bio || "",
    };
    
    if (site.profile.image && site.profile.image.url) {
      personData.image = site.profile.image.url;
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'person.json'),
      JSON.stringify(personData, null, 2)
    );
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'structured-data.json'),
    JSON.stringify(structuredData, null, 2)
  );
  
  payload.logger.info(`Generated structured data for ${site.title}`);
}

/**
 * Apply a template to the generated site
 */
async function applyTemplate(templateId, siteDir, siteData) {
  try {
    payload.logger.info(`Applying template: ${templateId} to site: ${siteData.site.title}`);
    
    const templatesDir = path.resolve(__dirname, '../../nextjs/templates');
    
    // Check if template exists
    const templatePath = path.join(templatesDir, templateId);
    if (!fs.existsSync(templatePath)) {
      payload.logger.warn(`Template not found: ${templateId}, using standard template`);
      // Default to standard template if the specified one doesn't exist
      const standardTemplatePath = path.join(templatesDir, 'standard');
      if (fs.existsSync(standardTemplatePath)) {
        await generateStandardTemplate(siteData, siteDir);
        return;
      } else {
        // Fall back to generating a very basic template
        return generateDefaultTemplate(siteData, siteDir);
      }
    }
    
    // Handle specific template types
    if (templateId === 'standard') {
      await generateStandardTemplate(siteData, siteDir);
    } else {
      // For other templates, implement their generation logic here
      payload.logger.info(`Custom template ${templateId} not implemented yet, using default`);
      return generateDefaultTemplate(siteData, siteDir);
    }
  } catch (error) {
    payload.logger.error(`Error applying template: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a site using the standard template
 */
async function generateStandardTemplate(siteData, outputDir) {
  try {
    payload.logger.info(`Generating standard template for site: ${siteData.site.title}`);
    
    const templatesDir = path.resolve(__dirname, '../../nextjs/templates/standard');
    
    // Create necessary directories
    const pagesDir = path.join(outputDir, 'pages');
    const blogDir = path.join(pagesDir, 'blog');
    const projectsDir = path.join(pagesDir, 'projects');
    const socialDir = path.join(pagesDir, 'social');
    const cssDir = path.join(outputDir, 'css');
    const jsDir = path.join(outputDir, 'js');
    
    // Ensure directories exist
    [pagesDir, blogDir, projectsDir, socialDir, cssDir, jsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // We'll use ReactDOMServer.renderToString in an actual implementation
    // For now, we'll just copy over the template files with placeholders
    
    // Generate home page
    fs.writeFileSync(
      path.join(outputDir, 'index.html'),
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${siteData.site.title || 'Home'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root">${siteData.site.title} - Home Page (Generated from template)</div>
        <script>
          window.SITE_DATA = ${JSON.stringify(siteData)};
        </script>
        <script src="/js/main.js"></script>
      </body>
      </html>`
    );
    
    // Generate about page
    fs.writeFileSync(
      path.join(pagesDir, 'about.html'),
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>About - ${siteData.site.title || 'About'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root">${siteData.site.title} - About Page (Generated from template)</div>
        <script>
          window.SITE_DATA = ${JSON.stringify(siteData)};
        </script>
        <script src="/js/main.js"></script>
      </body>
      </html>`
    );
    
    // Generate blog index page
    fs.writeFileSync(
      path.join(blogDir, 'index.html'),
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Blog - ${siteData.site.title || 'Blog'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root">${siteData.site.title} - Blog Page (Generated from template)</div>
        <script>
          window.SITE_DATA = ${JSON.stringify(siteData)};
        </script>
        <script src="/js/main.js"></script>
      </body>
      </html>`
    );
    
    // Generate individual blog post pages
    if (siteData.blogPosts && siteData.blogPosts.length > 0) {
      for (const post of siteData.blogPosts) {
        if (post.status === 'published') {
          const postDir = path.join(blogDir, post.id);
          if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
          }
          
          fs.writeFileSync(
            path.join(postDir, 'index.html'),
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${post.title} - ${siteData.site.title || 'Blog'}</title>
              <link rel="stylesheet" href="/css/styles.css">
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
              <div id="root">${post.title} - Blog Post (Generated from template)</div>
              <script>
                window.SITE_DATA = ${JSON.stringify({
                  ...siteData,
                  currentPost: post
                })};
              </script>
              <script src="/js/main.js"></script>
            </body>
            </html>`
          );
        }
      }
    }
    
    // Generate projects page
    fs.writeFileSync(
      path.join(projectsDir, 'index.html'),
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Projects - ${siteData.site.title || 'Projects'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root">${siteData.site.title} - Projects Page (Generated from template)</div>
        <script>
          window.SITE_DATA = ${JSON.stringify(siteData)};
        </script>
        <script src="/js/main.js"></script>
      </body>
      </html>`
    );
    
    // Generate social feed page
    fs.writeFileSync(
      path.join(socialDir, 'index.html'),
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Social Feed - ${siteData.site.title || 'Social'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root">${siteData.site.title} - Social Feed (Generated from template)</div>
        <script>
          window.SITE_DATA = ${JSON.stringify(siteData)};
        </script>
        <script src="/js/main.js"></script>
      </body>
      </html>`
    );
    
    // Generate contact page
    fs.writeFileSync(
      path.join(pagesDir, 'contact.html'),
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact - ${siteData.site.title || 'Contact'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root">${siteData.site.title} - Contact Page (Generated from template)</div>
        <script>
          window.SITE_DATA = ${JSON.stringify(siteData)};
        </script>
        <script src="/js/main.js"></script>
      </body>
      </html>`
    );
    
    // Add basic CSS file
    fs.writeFileSync(
      path.join(cssDir, 'styles.css'),
      `/* Generated styles for ${siteData.site.title} */
      :root {
        --primary-color: ${siteData.site.primaryColor || '#3490dc'};
        --secondary-color: ${siteData.site.secondaryColor || '#ffed4a'};
        --text-color: ${siteData.site.textColor || '#333'};
        --background-color: ${siteData.site.backgroundColor || '#fff'};
      }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: var(--text-color);
        background-color: var(--background-color);
        line-height: 1.6;
      }
      
      a {
        color: var(--primary-color);
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      /* Add more styles as needed */
      `
    );
    
    // Add basic JavaScript file
    fs.writeFileSync(
      path.join(jsDir, 'main.js'),
      `// Generated JavaScript for ${siteData.site.title}
      document.addEventListener('DOMContentLoaded', function() {
        console.log('Site data loaded:', window.SITE_DATA);
        // Add more client-side functionality here
      });
      `
    );
    
    payload.logger.info(`Standard template generated successfully for ${siteData.site.title}`);
  } catch (error) {
    payload.logger.error(`Error generating standard template: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a default template for sites without a specific template
 */
function generateDefaultTemplate(siteData, outputDir) {
  const { site, blogPosts, socialPosts } = siteData;
  
  const primaryColor = site.styles?.primaryColor || '#3b82f6';
  const textColor = site.styles?.textColor || '#333333';
  
  let blogPostsHtml = '';
  blogPosts.slice(0, 4).forEach(post => {
    blogPostsHtml += `
      <div class="blog-card">
        <h3>${post.title}</h3>
        <p>${post.excerpt || ''}</p>
        <a href="/blog/${post.slug || ''}">Read more</a>
      </div>
    `;
  });
  
  let socialPostsHtml = '';
  socialPosts.slice(0, 4).forEach(post => {
    socialPostsHtml += `
      <div class="social-card">
        <h3>${post.platform}</h3>
        <p>${post.content || ''}</p>
      </div>
    `;
  });
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${site.title || 'Website'}</title>
      <style>
        :root {
          --primary-color: ${primaryColor};
          --text-color: ${textColor};
        }
        body {
          font-family: system-ui, sans-serif;
          color: var(--text-color);
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        header {
          background: linear-gradient(to right, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, white));
          color: white;
          padding: 3rem 0;
        }
        h1, h2, h3 {
          margin-top: 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin: 40px 0;
        }
        .blog-card, .social-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .blog-card h3, .social-card h3 {
          color: var(--primary-color);
        }
        a {
          color: var(--primary-color);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .footer {
          margin-top: 60px;
          padding: 20px 0;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <h1>${site.title || 'Website'}</h1>
          <p>${site.subtitle || ''}</p>
        </div>
      </header>
      
      <main class="container">
        <section>
          <h2>About</h2>
          <div>${site.profile?.bio || 'Welcome to my website.'}</div>
        </section>
        
        <section>
          <h2>Blog</h2>
          <div class="grid">
            ${blogPostsHtml || '<p>No blog posts yet.</p>'}
          </div>
        </section>
        
        <section>
          <h2>Social</h2>
          <div class="grid">
            ${socialPostsHtml || '<p>No social posts yet.</p>'}
          </div>
        </section>
      </main>
      
      <footer class="footer container">
        <p>&copy; ${new Date().getFullYear()} ${site.title}. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `;
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Deploy a site to Vercel
 */
export const deployToVercel = async (options: { projectId?: string, token?: string }) => {
  const { projectId, token } = options;
  
  try {
    payload.logger.info(`Starting Vercel deployment for project: ${projectId || 'all projects'}`);
    
    if (!token && !process.env.VERCEL_TOKEN) {
      throw new Error('Vercel token is required for deployment');
    }
    
    const vercelToken = token || process.env.VERCEL_TOKEN;
    const outputDir = path.resolve(__dirname, '../../static-output');
    
    // Determine which sites to deploy
    let sitesToDeploy = [];
    if (projectId) {
      // Deploy a specific site
      const sitePath = path.join(outputDir, projectId);
      if (fs.existsSync(sitePath)) {
        sitesToDeploy.push({ projectId, path: sitePath });
      } else {
        throw new Error(`Site directory not found for project ${projectId}`);
      }
    } else {
      // Deploy all sites
      const siteDirectories = fs.readdirSync(outputDir)
        .filter(file => fs.statSync(path.join(outputDir, file)).isDirectory());
      
      sitesToDeploy = siteDirectories.map(dir => ({
        projectId: dir,
        path: path.join(outputDir, dir)
      }));
    }
    
    if (sitesToDeploy.length === 0) {
      throw new Error('No sites found to deploy');
    }
    
    // Deploy each site
    const deploymentResults = [];
    for (const site of sitesToDeploy) {
      payload.logger.info(`Deploying ${site.projectId} to Vercel...`);
      
      // In a real implementation, this would use the Vercel API to deploy the site
      // For this example, we'll simulate the deployment with the Vercel CLI
      
      try {
        // Use the Vercel CLI to deploy the site
        const vercelCommand = `npx vercel --token=${vercelToken} --prod --name=${site.projectId}`;
        const { stdout, stderr } = await execPromise(vercelCommand, { cwd: site.path });
        
        // Extract the deployment URL from the output
        const deploymentUrl = stdout.match(/(https:\/\/[\w.-]+\.vercel\.app)/)?.[1];
        
        deploymentResults.push({
          projectId: site.projectId,
          success: true,
          url: deploymentUrl || 'https://deployment-url-not-found.vercel.app',
          output: stdout
        });
        
        payload.logger.info(`Successfully deployed ${site.projectId} to Vercel`);
      } catch (error) {
        payload.logger.error(`Error deploying ${site.projectId} to Vercel:`, error);
        
        deploymentResults.push({
          projectId: site.projectId,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      message: `Deployment to Vercel completed for ${sitesToDeploy.length} site(s)`,
      deployments: deploymentResults
    };
  } catch (error) {
    payload.logger.error('Error deploying to Vercel:', error);
    return {
      success: false,
      message: `Error deploying to Vercel: ${error.message}`,
    };
  }
};

export default {
  generateStaticSite,
  deployToVercel,
};
