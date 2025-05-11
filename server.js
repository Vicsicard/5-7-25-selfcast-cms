/**
 * This is the standard Payload CMS server file
 * Following the exact pattern from Payload CMS documentation
 */

const express = require('express');
const payload = require('payload');

// Dotenv to load environment variables
require('dotenv').config();

// Create an Express app
const app = express();

// Initialize Payload
payload.init({
  secret: process.env.PAYLOAD_SECRET,
  mongoURL: process.env.MONGODB_URI,
  express: app,
})

// Add a route to the Express app
app.get('/', (req, res) => {
  res.redirect('/admin');
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}...`);
})
