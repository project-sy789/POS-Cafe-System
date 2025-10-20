import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

async function cleanupOldIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const collection = Order.collection;
    const indexes = await collection.indexes();

    console.log('\n📋 Current Indexes:');
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Drop the old compound index (createdAt, status) if it exists
    const oldIndex = indexes.find(idx => 
      idx.key.createdAt === -1 && idx.key.status === 1 && idx.name === 'createdAt_-1_status_1'
    );

    if (oldIndex) {
      console.log(`\n🗑️  Dropping old index: ${oldIndex.name}`);
      await collection.dropIndex(oldIndex.name);
      console.log('✓ Old index dropped successfully');
    } else {
      console.log('\n✓ No old indexes to clean up');
    }

    console.log('\n✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

cleanupOldIndexes();
