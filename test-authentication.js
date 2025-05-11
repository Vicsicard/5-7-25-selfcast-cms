// Test MongoDB connection with properly encoded credentials
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Create a properly encoded connection string
const username = encodeURIComponent('vicsicard@gmail.com');
const password = encodeURIComponent('Manniemae1993!');
const cluster = 'payloadonetorulethemall.9t4fnbt.mongodb.net';
const dbname = 'payload-cms';
const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`;

console.log('MongoDB Connection Test with properly encoded credentials');
console.log('Username:', username);
console.log('Password: [REDACTED]');
console.log('Cluster:', cluster);
console.log('Database:', dbname);

async function run() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Success! Connected to MongoDB Atlas cluster.");
    
    // Save the working connection string to .env
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnvContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${uri}`
    );
    fs.writeFileSync('.env', updatedEnvContent);
    console.log('✅ Updated .env file with working connection string');
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

run().catch(console.dir);
