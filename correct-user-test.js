// Correct username MongoDB connection test
const { MongoClient, ServerApiVersion } = require('mongodb');
const readline = require('readline');

// Configure the correct username
const username = 'Vicsicard'; // <-- This is the correct username from MongoDB Atlas
const cluster = 'payloadonetorulethemall.9t4fnbt.mongodb.net';
const dbname = 'payload-cms';

// Create a readline interface for secure password input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MongoDB Connection Test with Correct Username');
console.log('Username: ' + username);
console.log('Cluster: ' + cluster);
console.log('Database: ' + dbname);

// Prompt for password securely
rl.question('Enter your MongoDB password: ', async (password) => {
  // Hide the input cursor line
  process.stdout.write('\n');
  
  const encodedPassword = encodeURIComponent(password);
  
  // Build the full SRV connection URI
  const uri = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`;
  
  console.log('\nFull MongoDB URI (with credentials hidden):');
  console.log(`mongodb+srv://${username}:***@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`);
  
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

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
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  } finally {
    await client.close();
    console.log('Connection closed.');
    rl.close();
  }
});
