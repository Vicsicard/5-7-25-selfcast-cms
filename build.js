const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy server.js to dist directory
const serverSrc = path.join(__dirname, 'src', 'server.js');
const serverDest = path.join(distDir, 'server.js');

fs.copyFileSync(serverSrc, serverDest);
console.log('Server file copied to dist directory');

// Log build completion
console.log('Build process completed successfully');
console.log(`Server URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://selfcast-cms-admin.onrender.com'}`);
console.log('Admin panel will be available at /admin after deployment');
