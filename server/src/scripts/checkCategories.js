import mongoose from 'mongoose';
import Category from '../models/Category.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-pos';

async function checkCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const categories = await Category.find();
    console.log(`Total categories: ${categories.length}\n`);

    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   - imageUrl: ${cat.imageUrl || 'none'}`);
      console.log(`   - imageData: ${cat.imageData ? `${cat.imageData.substring(0, 50)}...` : 'none'}`);
      console.log(`   - iconUrl: ${cat.iconUrl || 'none'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCategories();
