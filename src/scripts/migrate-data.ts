/**
 * Data Migration Script
 * 
 * This script connects to the MongoDB database and migrates existing data
 * to work with our new user-centric schema by creating proper relationships.
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// MongoDB connection details
const mongoUrl = process.env.MONGODB_URI || '';
const dbName = 'payload-cms'; // This should match the DB name in your connection string

async function migrateData() {
  if (!mongoUrl) {
    console.error('MongoDB URI is not defined in environment variables');
    return;
  }

  console.log('Starting data migration...');
  const client = new MongoClient(mongoUrl);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Check if admin user exists
    const adminUser = await db.collection('users').findOne({ email: 'vicsicard@gmail.com' });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      // Create admin user if it doesn't exist
      const adminResult = await db.collection('users').insertOne({
        email: 'vicsicard@gmail.com',
        role: 'admin',
        name: 'Vic Sicard',
        accountStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Admin user created with ID: ${adminResult.insertedId}`);
    } else {
      // Update admin role if needed
      if (adminUser.role !== 'admin') {
        await db.collection('users').updateOne(
          { _id: adminUser._id },
          { $set: { role: 'admin' } }
        );
        console.log('Updated admin user role');
      }
    }
    
    // Get admin user ID for reference
    const admin = await db.collection('users').findOne({ email: 'vicsicard@gmail.com' });
    const adminId = admin?._id;
    
    if (!adminId) {
      console.error('Could not find or create admin user');
      return;
    }
    
    // Get all sites
    const sites = await db.collection('sites').find({}).toArray();
    console.log(`Found ${sites.length} sites`);
    
    // Process each site to create missing users and relationships
    for (const site of sites) {
      console.log(`Processing site: ${site.title || site.projectId}`);
      
      // Check if site already has a user relationship
      if (site.user) {
        console.log(`Site already has user relationship: ${site.user}`);
        continue;
      }
      
      // Create a user for this site if needed
      const siteName = site.title || site.projectId;
      const userName = siteName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const userEmail = `${userName}@example.com`;
      
      // Check if a user with this email already exists
      let user = await db.collection('users').findOne({ email: userEmail });
      
      if (!user) {
        // Create a new user for this site
        const userResult = await db.collection('users').insertOne({
          email: userEmail,
          password: '$2a$10$X4hA4VEZe3T9j7UVK3YU8ebx.azF1SiBMJdVJc6H/D.U6JcN9m1dy', // Default password: Password123 (hashed)
          role: 'user',
          name: siteName,
          accountStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        const userId = userResult.insertedId;
        console.log(`Created new user ${userEmail} with ID: ${userId}`);
        
        // Update the site with the user relationship
        await db.collection('sites').updateOne(
          { _id: site._id },
          { $set: { user: userId } }
        );
        
        // Update the user with a reference to their site
        await db.collection('users').updateOne(
          { _id: userId },
          { $set: { userSite: site._id } }
        );
        
        user = { _id: userId, email: userEmail };
      } else {
        console.log(`User ${userEmail} already exists. Linking to site.`);
        
        // Update the site with the user relationship
        await db.collection('sites').updateOne(
          { _id: site._id },
          { $set: { user: user._id } }
        );
        
        // Update the user with a reference to their site
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { userSite: site._id } }
        );
      }
      
      // Link content (blog posts, social posts, etc.) to the user
      // Blog Posts
      await db.collection('blog-posts').updateMany(
        { siteId: site._id, user: { $exists: false } },
        { $set: { user: user._id } }
      );
      
      // Social Posts
      await db.collection('social-posts').updateMany(
        { siteId: site._id, user: { $exists: false } },
        { $set: { user: user._id } }
      );
      
      // Bio Cards
      await db.collection('bio-cards').updateMany(
        { siteId: site._id, user: { $exists: false } },
        { $set: { user: user._id } }
      );
      
      // Quotes
      await db.collection('quotes').updateMany(
        { siteId: site._id, user: { $exists: false } },
        { $set: { user: user._id } }
      );
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the migration
migrateData().catch(console.error);
