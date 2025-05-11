const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy root server.js to dist directory (overriding any existing server.js)
const rootServerSrc = path.join(__dirname, 'server.js');
const serverDest = path.join(distDir, 'server.js');

if (fs.existsSync(rootServerSrc)) {
  fs.copyFileSync(rootServerSrc, serverDest);
  console.log('Root server.js file copied to dist directory');
} else {
  // Fallback to src/server.js if root server.js doesn't exist
  const srcServerPath = path.join(__dirname, 'src', 'server.js');
  if (fs.existsSync(srcServerPath)) {
    fs.copyFileSync(srcServerPath, serverDest);
    console.log('src/server.js file copied to dist directory');
  } else {
    console.error('No server.js file found to copy! Build may fail.');
  }
}

// Ensure the admin UI is properly accessible
const adminDir = path.join(distDir, 'admin');
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true });
}

// Create a simple index.html for /admin route if it doesn't exist
const adminIndexPath = path.join(adminDir, 'index.html');
if (!fs.existsSync(adminIndexPath)) {
  const adminIndexContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payload CMS Admin</title>
  <script>
    // Redirect to actual admin path if needed
    window.location.href = '/admin';
  </script>
</head>
<body>
  <h1>Redirecting to Payload CMS Admin...</h1>
</body>
</html>`;
  
  fs.writeFileSync(adminIndexPath, adminIndexContent);
  console.log('Created admin index.html file');
}

// Log build completion
console.log('Build process completed successfully');
console.log(`Server URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://selfcast-cms-admin.onrender.com'}`);
console.log('Admin panel will be available at /admin after deployment');
