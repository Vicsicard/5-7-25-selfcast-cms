// Simple MongoDB connection test
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection URL - Using the properly encoded URL
const uri = process.env.MONGODB_URI.replace('!', '%21');
console.log('MongoDB Connection Test');
console.log('Encoded URI:', uri.replace(/mongodb:\/\/.*?@/, 'mongodb://***:***@'));

async function testConnection() {
  console.log('Attempting to connect to MongoDB...');
  
  try {
    // Create a new MongoClient
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true
    });

    // Connect to the MongoDB server
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Ping database to confirm connection
    const adminDb = client.db().admin();
    const result = await adminDb.ping();
    console.log('Ping result:', result);
    
    // List available databases
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Close the connection
    await client.close();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    process.exit(1);
  }
}

// Run the test
testConnection();
