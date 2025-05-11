// Simple test route to verify server is running
const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running correctly',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
