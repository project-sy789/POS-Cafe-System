import mongoose from 'mongoose';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-pos';

async function migrateCategoryImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all categories with imageUrl but no imageData
    const categories = await Category.find({
      imageUrl: { $exists: true, $ne: '' },
      $or: [
        { imageData: { $exists: false } },
        { imageData: '' }
      ]
    });

    console.log(`Found ${categories.length} categories to migrate`);

    let successCount = 0;
    let failCount = 0;

    for (const category of categories) {
      try {
        // Extract filename from imageUrl
        const filename = category.imageUrl.replace('/uploads/', '');
        const filePath = path.join(__dirname, '../../../uploads', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found for category "${category.name}": ${filePath}`);
          failCount++;
          continue;
        }

        // Read file and convert to base64
        const imageBuffer = fs.readFileSync(filePath);
        
        // Determine MIME type from file extension
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.gif') mimeType = 'image/gif';

        const base64Image = imageBuffer.toString('base64');
        category.imageData = `data:${mimeType};base64,${base64Image}`;

        await category.save();
        console.log(`✅ Migrated: ${category.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error migrating category "${category.name}":`, error.message);
        failCount++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${categories.length}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateCategoryImages();
