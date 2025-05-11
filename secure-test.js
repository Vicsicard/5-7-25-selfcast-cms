// Secure MongoDB connection test
const { MongoClient, ServerApiVersion } = require('mongodb');
const readline = require('readline');

// Configure username and cluster information
const username = encodeURIComponent('vicsicard@gmail.com');
const cluster = 'payloadonetorulethemall.9t4fnbt.mongodb.net';
const dbname = 'payload-cms';

// Create a readline interface for secure password input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MongoDB Connection Test with SRV format');
console.log('Username:', username);
console.log('Cluster:', cluster);
console.log('Database:', dbname);

// Prompt for password securely
rl.question('Enter your MongoDB password: ', async (password) => {
  // Hide the input cursor line
  process.stdout.write('\n');
  
  // Encode the password properly
  const encodedPassword = encodeURIComponent(password);
  
  // Build the SRV connection URI
  const uri = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`;
  
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
    
    // Show available databases if connection successful
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('\nAvailable databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Save the working connection string with proper encoding to .env
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const newConnectionString = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`;
    const updatedEnvContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${newConnectionString}`
    );
    fs.writeFileSync('.env', updatedEnvContent);
    console.log('\n✅ Updated .env file with working connection string');
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    
    // Show more detailed error diagnostics
    if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('\nAuthentication failed. Possible reasons:');
      console.error('1. Incorrect password');
      console.error('2. The user may not have access to this cluster');
      console.error('3. Special characters in password not properly encoded');
      console.error('\nSuggestion: Try resetting your password in MongoDB Atlas to something without special characters.');
    }
    
  } finally {
    await client.close();
    console.log('Connection closed.');
    rl.close();
  }
});
