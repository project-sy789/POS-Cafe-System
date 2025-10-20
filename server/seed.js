import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import Settings from './src/models/Settings.js';

dotenv.config();

// Sample data
const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'Manager'
  },
  {
    username: 'cashier1',
    password: 'cashier123',
    role: 'Cashier'
  },
  {
    username: 'barista1',
    password: 'barista123',
    role: 'Barista'
  }
];

const categories = [
  {
    name: 'Coffee',
    description: 'Hot and iced coffee beverages'
  },
  {
    name: 'Tea',
    description: 'Various tea selections'
  },
  {
    name: 'Smoothies',
    description: 'Fresh fruit smoothies'
  },
  {
    name: 'Pastries',
    description: 'Fresh baked goods'
  },
  {
    name: 'Sandwiches',
    description: 'Sandwiches and wraps'
  }
];

const defaultSettings = {
  storeName: 'My Café',
  address: '123 Main Street, Bangkok, Thailand',
  taxRate: 7,
  taxIncludedInPrice: false, // Tax is added on top of price
  promptPayId: '0812345678',
  promptPayType: 'phone',
  currency: 'THB'
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed Users
    console.log('\n👥 Seeding users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // This triggers the pre-save hook to hash password
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users:`);
    createdUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });

    // Seed Categories
    console.log('\n📁 Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories:`);
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name}`);
    });

    // Seed Products
    console.log('\n☕ Seeding products...');
    const products = [
      // Coffee
      {
        name: 'Espresso',
        price: 45,
        description: 'Strong and bold espresso shot',
        category: createdCategories[0]._id,
        stockCount: 100,
        lowStockThreshold: 20,
        isAvailable: true
      },
      {
        name: 'Americano',
        price: 55,
        description: 'Espresso with hot water',
        category: createdCategories[0]._id,
        stockCount: 100,
        lowStockThreshold: 20,
        isAvailable: true
      },
      {
        name: 'Cappuccino',
        price: 65,
        description: 'Espresso with steamed milk and foam',
        category: createdCategories[0]._id,
        stockCount: 100,
        lowStockThreshold: 20,
        isAvailable: true
      },
      {
        name: 'Latte',
        price: 70,
        description: 'Espresso with steamed milk',
        category: createdCategories[0]._id,
        stockCount: 100,
        lowStockThreshold: 20,
        isAvailable: true
      },
      {
        name: 'Iced Coffee',
        price: 60,
        description: 'Cold brewed coffee over ice',
        category: createdCategories[0]._id,
        stockCount: 100,
        lowStockThreshold: 20,
        isAvailable: true
      },
      // Tea
      {
        name: 'Green Tea',
        price: 50,
        description: 'Traditional green tea',
        category: createdCategories[1]._id,
        stockCount: 80,
        lowStockThreshold: 15,
        isAvailable: true
      },
      {
        name: 'Thai Tea',
        price: 55,
        description: 'Sweet Thai iced tea',
        category: createdCategories[1]._id,
        stockCount: 80,
        lowStockThreshold: 15,
        isAvailable: true
      },
      {
        name: 'Milk Tea',
        price: 60,
        description: 'Creamy milk tea',
        category: createdCategories[1]._id,
        stockCount: 80,
        lowStockThreshold: 15,
        isAvailable: true
      },
      // Smoothies
      {
        name: 'Mango Smoothie',
        price: 75,
        description: 'Fresh mango blended smoothie',
        category: createdCategories[2]._id,
        stockCount: 50,
        lowStockThreshold: 10,
        isAvailable: true
      },
      {
        name: 'Strawberry Smoothie',
        price: 75,
        description: 'Fresh strawberry smoothie',
        category: createdCategories[2]._id,
        stockCount: 50,
        lowStockThreshold: 10,
        isAvailable: true
      },
      {
        name: 'Mixed Berry Smoothie',
        price: 80,
        description: 'Blend of berries',
        category: createdCategories[2]._id,
        stockCount: 50,
        lowStockThreshold: 10,
        isAvailable: true
      },
      // Pastries
      {
        name: 'Croissant',
        price: 45,
        description: 'Buttery French croissant',
        category: createdCategories[3]._id,
        stockCount: 30,
        lowStockThreshold: 5,
        isAvailable: true
      },
      {
        name: 'Chocolate Muffin',
        price: 50,
        description: 'Rich chocolate muffin',
        category: createdCategories[3]._id,
        stockCount: 25,
        lowStockThreshold: 5,
        isAvailable: true
      },
      {
        name: 'Blueberry Muffin',
        price: 50,
        description: 'Fresh blueberry muffin',
        category: createdCategories[3]._id,
        stockCount: 25,
        lowStockThreshold: 5,
        isAvailable: true
      },
      // Sandwiches
      {
        name: 'Ham & Cheese Sandwich',
        price: 85,
        description: 'Classic ham and cheese',
        category: createdCategories[4]._id,
        stockCount: 20,
        lowStockThreshold: 5,
        isAvailable: true
      },
      {
        name: 'Tuna Sandwich',
        price: 90,
        description: 'Tuna salad sandwich',
        category: createdCategories[4]._id,
        stockCount: 20,
        lowStockThreshold: 5,
        isAvailable: true
      },
      {
        name: 'Chicken Wrap',
        price: 95,
        description: 'Grilled chicken wrap',
        category: createdCategories[4]._id,
        stockCount: 20,
        lowStockThreshold: 5,
        isAvailable: true
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Seed Settings
    console.log('\n⚙️  Seeding settings...');
    const settings = await Settings.create(defaultSettings);
    console.log('✅ Created default settings:');
    console.log(`   - Store: ${settings.storeName}`);
    console.log(`   - Tax Rate: ${settings.taxRate}%`);
    console.log(`   - PromptPay ID: ${settings.promptPayId}`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Default Login Credentials:');
    console.log('   Manager:');
    console.log('     Username: admin');
    console.log('     Password: admin123');
    console.log('   Cashier:');
    console.log('     Username: cashier1');
    console.log('     Password: cashier123');
    console.log('   Barista:');
    console.log('     Username: barista1');
    console.log('     Password: barista123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
