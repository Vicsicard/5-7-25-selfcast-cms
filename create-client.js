// Create Client Script for Self Cast Studios CMS
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main function
async function createClient() {
  console.log('\n=========================================');
  console.log('🔑 Self Cast Studios Client Creator');
  console.log('=========================================\n');
  
  // Get client information
  const email = await prompt('Enter client email: ');
  const password = await prompt('Enter client password: ');
  const name = await prompt('Enter client name (optional): ');
  
  // Validate input
  if (!email || !password) {
    console.error('Error: Email and password are required');
    rl.close();
    return;
  }
  
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      rl.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      email,
      password: hashedPassword,
      name: name || '',
      role: 'client',
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    // Create initial site configuration for the new client
    const initialSite = {
      userId: result.insertedId.toString(),
      title: name || 'New Client Site',
      createdAt: new Date(),
      pages: {
        home: { visible: true },
        about: { visible: true },
        blog: { visible: true },
        projects: { visible: true },
        social: { visible: true },
        contact: { visible: true }
      }
    };
    
    await db.collection('sites').insertOne(initialSite);
    
    console.log('\n=========================================');
    console.log('✅ Client created successfully!');
    console.log('=========================================');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name || 'Not provided'}`);
    console.log(`Password: ${password}`);
    console.log(`Role: client`);
    console.log(`ID: ${result.insertedId.toString()}`);
    console.log('=========================================\n');
    
  } catch (err) {
    console.error('Error creating client:', err);
  } finally {
    if (client) await client.close();
    rl.close();
  }
}

// Run the script
createClient();
