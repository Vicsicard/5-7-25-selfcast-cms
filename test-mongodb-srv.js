// Test MongoDB connection with SRV format
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Log the connection string (without credentials)
const uri = process.env.MONGODB_URI;
const redactedUri = uri.replace(/mongodb\+srv:\/\/.*?@/, 'mongodb+srv://***:***@');
console.log('MongoDB Connection Test (SRV format)');
console.log('Using connection string:', redactedUri);

async function run() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect the client to the server
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Success! Connected to MongoDB Atlas cluster.");
    
    // List available databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk/1024/1024).toFixed(2)} MB)`);
    });
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log('Connection closed.');
  }
}

run().catch(console.dir);
