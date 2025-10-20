import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function migrateBaristaUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    console.log('🔄 Migrating Barista users to Cashier role...\n');
    console.log('=' .repeat(60));

    // Find all Barista users
    const baristaUsers = await User.find({ role: 'Barista' });
    
    console.log(`\nFound ${baristaUsers.length} Barista user(s)\n`);

    if (baristaUsers.length === 0) {
      console.log('✅ No Barista users to migrate');
      return;
    }

    // Display users to be migrated
    console.log('Users to be migrated:');
    baristaUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (ID: ${user._id})`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('\n⚠️  This will change all Barista users to Cashier role.');
    console.log('Cashier users can access both POS and Barista pages.\n');

    // Update all Barista users to Cashier
    const result = await User.updateMany(
      { role: 'Barista' },
      { $set: { role: 'Cashier' } }
    );

    console.log(`✅ Successfully migrated ${result.modifiedCount} user(s) from Barista to Cashier\n`);

    // Verify the migration
    const remainingBaristas = await User.countDocuments({ role: 'Barista' });
    const cashierCount = await User.countDocuments({ role: 'Cashier' });
    const managerCount = await User.countDocuments({ role: 'Manager' });

    console.log('Current user role distribution:');
    console.log(`  - Cashier: ${cashierCount}`);
    console.log(`  - Manager: ${managerCount}`);
    console.log(`  - Barista: ${remainingBaristas} (should be 0)`);

    if (remainingBaristas > 0) {
      console.log('\n⚠️  Warning: Some Barista users still exist!');
    } else {
      console.log('\n✅ Migration completed successfully!');
      console.log('\nNote: Cashier users now have access to:');
      console.log('  - POS page (create orders)');
      console.log('  - Barista page (view and update order queue)');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
}

migrateBaristaUsers();
