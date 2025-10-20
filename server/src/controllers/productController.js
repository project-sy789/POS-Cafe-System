import Product from '../models/Product.js';
import Order from '../models/Order.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { emitProductUpdate } from '../socket/socketHandlers.js';
import { getIO } from '../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all products with optional category filter
 * GET /api/products?category=<categoryId>
 */
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }

    // Fetch products and populate category
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching products'
    });
  }
};

/**
 * Get a single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('category', 'name description');

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);

    // Handle invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid product ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching the product'
    });
  }
};

/**
 * Create a new product
 * POST /api/products
 * Requires Manager role
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stockCount, lowStockThreshold, isAvailable, options } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, price, and category are required'
      });
    }

    // Handle image upload
    let imageUrl = '';
    if (req.files && req.files.image && req.files.image[0]) {
      // Store relative path for the image
      imageUrl = `/uploads/${req.files.image[0].filename}`;
    }

    // Parse options if provided
    let parsedOptions = [];
    if (options) {
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (error) {
        console.error('Error parsing options:', error);
      }
    }

    // Handle option icon uploads
    if (req.files && req.files.optionIcons && parsedOptions.length > 0) {
      const iconFiles = req.files.optionIcons;
      let iconIndex = 0;

      // Map icon files to option values
      for (let groupIndex = 0; groupIndex < parsedOptions.length; groupIndex++) {
        const group = parsedOptions[groupIndex];
        if (group.values && Array.isArray(group.values)) {
          for (let valueIndex = 0; valueIndex < group.values.length; valueIndex++) {
            // Check if this value should have an icon (based on upload order)
            if (iconIndex < iconFiles.length) {
              const iconFile = iconFiles[iconIndex];
              parsedOptions[groupIndex].values[valueIndex].iconUrl = `/uploads/${iconFile.filename}`;
              iconIndex++;
            }
          }
        }
      }
    }

    // Create new product
    const product = new Product({
      name,
      price: parseFloat(price),
      description: description || '',
      imageUrl,
      category,
      stockCount: stockCount !== undefined ? parseInt(stockCount) : 0,
      lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 10,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : true,
      options: parsedOptions
    });

    await product.save();

    // Populate category before sending response
    await product.populate('category', 'name');

    // Emit product_update event via Socket.IO
    const io = getIO();
    if (io) {
      emitProductUpdate(io, 'create', product);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);

    // Delete uploaded files if product creation fails
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.image[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      if (req.files.optionIcons) {
        req.files.optionIcons.forEach(file => {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while creating the product'
    });
  }
};

/**
 * Update a product
 * PUT /api/products/:id
 * Requires Manager role
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, stockCount, lowStockThreshold, isAvailable, options } = req.body;

    // Find product
    const product = await Product.findById(id);

    if (!product) {
      // Delete uploaded files if product not found
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          const filePath = path.join(__dirname, '../../uploads', req.files.image[0].filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        if (req.files.optionIcons) {
          req.files.optionIcons.forEach(file => {
            const filePath = path.join(__dirname, '../../uploads', file.filename);
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting file:', err);
            });
          });
        }
      }

      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    // Store old image path for deletion if new image is uploaded
    const oldImageUrl = product.imageUrl;
    const oldOptionIcons = [];

    // Collect old option icons for potential deletion
    if (product.options && product.options.length > 0) {
      product.options.forEach(group => {
        if (group.values && Array.isArray(group.values)) {
          group.values.forEach(value => {
            if (value.iconUrl && value.iconUrl.startsWith('/uploads/')) {
              oldOptionIcons.push(value.iconUrl);
            }
          });
        }
      });
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (stockCount !== undefined) product.stockCount = parseInt(stockCount);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = parseInt(lowStockThreshold);
    if (isAvailable !== undefined) product.isAvailable = isAvailable === 'true' || isAvailable === true;

    // Parse and update options
    if (options !== undefined) {
      let parsedOptions = [];
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (error) {
        console.error('Error parsing options:', error);
      }

      // Handle option icon uploads
      if (req.files && req.files.optionIcons && parsedOptions.length > 0) {
        const iconFiles = req.files.optionIcons;
        let iconIndex = 0;

        // Map icon files to option values
        for (let groupIndex = 0; groupIndex < parsedOptions.length; groupIndex++) {
          const group = parsedOptions[groupIndex];
          if (group.values && Array.isArray(group.values)) {
            for (let valueIndex = 0; valueIndex < group.values.length; valueIndex++) {
              const value = group.values[valueIndex];
              // If value already has an iconUrl (from existing data), keep it
              // Otherwise, assign new icon if available
              if (!value.iconUrl && iconIndex < iconFiles.length) {
                const iconFile = iconFiles[iconIndex];
                parsedOptions[groupIndex].values[valueIndex].iconUrl = `/uploads/${iconFile.filename}`;
                iconIndex++;
              }
            }
          }
        }
      }

      product.options = parsedOptions;

      // Delete old option icons that are no longer used
      const newOptionIcons = [];
      parsedOptions.forEach(group => {
        if (group.values && Array.isArray(group.values)) {
          group.values.forEach(value => {
            if (value.iconUrl && value.iconUrl.startsWith('/uploads/')) {
              newOptionIcons.push(value.iconUrl);
            }
          });
        }
      });

      // Delete icons that are no longer referenced
      oldOptionIcons.forEach(oldIcon => {
        if (!newOptionIcons.includes(oldIcon)) {
          const oldFilePath = path.join(__dirname, '../../', oldIcon);
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Error deleting old icon:', err);
          });
        }
      });
    }

    // Handle product image upload
    if (req.files && req.files.image && req.files.image[0]) {
      product.imageUrl = `/uploads/${req.files.image[0].filename}`;

      // Delete old image file if it exists
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', oldImageUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
    }

    await product.save();

    // Populate category before sending response
    await product.populate('category', 'name');

    // Emit product_update event via Socket.IO
    const io = getIO();
    if (io) {
      emitProductUpdate(io, 'update', product);
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);

    // Delete uploaded files if update fails
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.image[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      if (req.files.optionIcons) {
        req.files.optionIcons.forEach(file => {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message
      });
    }

    // Handle invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid product ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating the product'
    });
  }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 * Requires Manager role
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    // Emit product_update event via Socket.IO before deleting
    const io = getIO();
    if (io) {
      emitProductUpdate(io, 'delete', product);
    }

    // Delete associated image file if it exists
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', product.imageUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);

    // Handle invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid product ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while deleting the product'
    });
  }
};

/**
 * Get best-selling products based on sales statistics
 * GET /api/products/best-sellers?limit=10
 * Requires authentication
 */
export const getBestSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate orders to find best-selling products
    const bestSellers = await Order.aggregate([
      // Match only completed orders
      { $match: { status: 'Completed' } },
      // Unwind items array to process each item separately
      { $unwind: '$items' },
      // Group by product ID and sum quantities
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      // Sort by total sold in descending order
      { $sort: { totalSold: -1 } },
      // Limit to top N products
      { $limit: limit }
    ]);

    // Handle empty results
    if (!bestSellers || bestSellers.length === 0) {
      return res.json({ products: [] });
    }

    // Extract product IDs
    const productIds = bestSellers.map(item => item._id);

    // Fetch full product details
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category', 'name');

    // Merge products with sales data and maintain sort order
    const productsWithSales = bestSellers.map(seller => {
      const product = products.find(
        p => p._id.toString() === seller._id.toString()
      );
      
      if (product) {
        return {
          ...product.toObject(),
          totalSold: seller.totalSold
        };
      }
      return null;
    }).filter(p => p !== null); // Remove null entries for deleted products

    res.json({ products: productsWithSales });
  } catch (error) {
    console.error('Get best-selling products error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching best-selling products'
    });
  }
};
