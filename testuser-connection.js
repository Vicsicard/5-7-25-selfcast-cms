// Test with new user Testuser
const { MongoClient, ServerApiVersion } = require('mongodb');

// Configure connection details with the new user
const username = 'Testuser';
const password = 'Testing123456';
const cluster = 'payloadonetorulethemall.9t4fnbt.mongodb.net';
const dbname = 'payload-cms';

// Build the full SRV connection URI
const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`;

console.log('MongoDB Connection Test with New User');
console.log('Username: ' + username);
console.log('Cluster: ' + cluster);
console.log('Database: ' + dbname);
console.log('\nFull MongoDB URI (with credentials hidden):');
console.log(`mongodb+srv://${username}:***@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log('\nConnecting to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Success! Connected to MongoDB Atlas cluster.");
    
    // List available databases if connection successful
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Save the working connection string to .env
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedEnvContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${uri}`
    );
    fs.writeFileSync('.env', updatedEnvContent);
    console.log('\n✅ Updated .env file with working connection string');
    
    // Return success
    return { success: true, message: "Successfully connected to MongoDB" };
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    return { success: false, error: error.message };
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

// Run the test
run().then(result => {
  if (result.success) {
    console.log('\n🎉 Connection test successful! Your MongoDB connection is working.');
    process.exit(0);
  } else {
    console.error('\n❌ Connection test failed. Please check your credentials and try again.');
    process.exit(1);
  }
});
