// Clear MongoDB connection test
const { MongoClient, ServerApiVersion } = require('mongodb');
const readline = require('readline');

// Configure the original username (without encoding)
const originalUsername = 'vicsicard@gmail.com';
const encodedUsername = encodeURIComponent(originalUsername);
const cluster = 'payloadonetorulethemall.9t4fnbt.mongodb.net';
const dbname = 'payload-cms';

// Create a readline interface for secure password input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MongoDB Connection Test');
console.log('Original Username: ' + originalUsername);
console.log('URL-Encoded Username: ' + encodedUsername);
console.log('Cluster: ' + cluster);
console.log('Database: ' + dbname);

// Prompt for password securely
rl.question('Enter your MongoDB password: ', async (password) => {
  // Hide the input cursor line
  process.stdout.write('\n');
  
  console.log('Original Password: ' + password);
  const encodedPassword = encodeURIComponent(password);
  console.log('URL-Encoded Password: ' + encodedPassword);
  
  // Build the full SRV connection URI
  const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`;
  
  console.log('\nFull MongoDB URI (with credentials hidden):');
  console.log(`mongodb+srv://***:***@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Payloadonetorulethemall`);
  
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
    
    // Show more detailed error diagnostics
    if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('\nAuthentication failed. Possible reasons:');
      console.error('1. Incorrect username or password');
      console.error('2. The user may not have access to this database/cluster');
      console.error('\nSuggestion: Check your MongoDB Atlas dashboard to verify:');
      console.error('- User exists and has correct password');
      console.error('- User has appropriate permissions');
      console.error('- Try creating a new database user with simple credentials');
    }
    
  } finally {
    await client.close();
    console.log('Connection closed.');
    rl.close();
  }
});
