import express from 'express';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import ProductOption from '../models/ProductOption.js';

const router = express.Router();

// Seed endpoint - only for initial setup
router.post('/initialize', async (req, res) => {
  try {
    // Check if already initialized
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return res.status(400).json({ 
        message: 'Database already initialized',
        users: existingUsers 
      });
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'Manager'
    });

    // Create cashier user
    const cashier = await User.create({
      username: 'cashier1',
      password: 'cashier123',
      role: 'Cashier'
    });

    // Create categories
    const categories = await Category.insertMany([
      { name: 'กาแฟ', icon: '☕', order: 1 },
      { name: 'ชา', icon: '🍵', order: 2 },
      { name: 'เครื่องดื่มปั่น', icon: '🥤', order: 3 },
      { name: 'เบเกอรี่', icon: '🥐', order: 4 },
      { name: 'ขนม', icon: '🍰', order: 5 }
    ]);

    // Create default settings
    await Settings.create({
      storeName: 'Café POS',
      storeAddress: '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
      storePhone: '02-123-4567',
      taxRate: 7,
      taxType: 'add',
      promptPayId: '0812345678',
      theme: 'default',
      featuredCategory: {
        enabled: true,
        mode: 'all',
        label: 'ทั้งหมด',
        icon: '⭐'
      }
    });

    // Create sample products
    const coffeeCategory = categories.find(c => c.name === 'กาแฟ');
    await Product.insertMany([
      {
        name: 'Americano',
        price: 45,
        category: coffeeCategory._id,
        imageUrl: '',
        description: 'กาแฟอเมริกาโน่',
        available: true
      },
      {
        name: 'Cappuccino',
        price: 55,
        category: coffeeCategory._id,
        imageUrl: '',
        description: 'กาแฟคาปูชิโน่',
        available: true
      },
      {
        name: 'Latte',
        price: 55,
        category: coffeeCategory._id,
        imageUrl: '',
        description: 'กาแฟลาเต้',
        available: true
      }
    ]);

    // Create product options
    await ProductOption.insertMany([
      {
        name: 'ขนาด',
        type: 'single',
        required: true,
        values: [
          { name: 'เล็ก', priceModifier: 0 },
          { name: 'กลาง', priceModifier: 10 },
          { name: 'ใหญ่', priceModifier: 20 }
        ]
      },
      {
        name: 'ความหวาน',
        type: 'single',
        required: false,
        values: [
          { name: 'ไม่หวาน', priceModifier: 0 },
          { name: 'หวานน้อย', priceModifier: 0 },
          { name: 'หวานปกติ', priceModifier: 0 },
          { name: 'หวานมาก', priceModifier: 0 }
        ]
      }
    ]);

    res.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        users: 2,
        categories: categories.length,
        products: 3,
        settings: 1,
        productOptions: 2
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize database',
      message: error.message 
    });
  }
});

export default router;
