import Category from '../models/Category.js';
import { emitCategoryUpdate } from '../socket/socketHandlers.js';
import { getIO } from '../server.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching categories'
    });
  }
};

/**
 * Create a new category
 * POST /api/categories
 * Requires Manager role
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Category name is required'
      });
    }

    // Handle file uploads
    let imageUrl = '';
    let iconUrl = '';
    let imageData = '';

    if (req.files) {
      // Handle image upload - convert to base64
      if (req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        
        // Validate file size (max 2MB)
        if (imageFile.size > 2 * 1024 * 1024) {
          // Delete uploaded file
          fs.unlinkSync(imageFile.path);
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Image size must be less than 2MB'
          });
        }
        
        // Read file and convert to base64
        const imageBuffer = await fsPromises.readFile(imageFile.path);
        const base64Image = imageBuffer.toString('base64');
        imageData = `data:${imageFile.mimetype};base64,${base64Image}`;
        
        // Delete temporary file
        fs.unlinkSync(imageFile.path);
        
        // Keep imageUrl for backward compatibility
        imageUrl = `/uploads/${imageFile.filename}`;
      }
      
      if (req.files.icon && req.files.icon[0]) {
        iconUrl = `/uploads/${req.files.icon[0].filename}`;
      }
    }

    // Create new category
    const category = new Category({
      name,
      description: description || '',
      imageUrl,
      iconUrl,
      imageData
    });

    await category.save();

    // Emit category_update event via Socket.IO
    const io = getIO();
    if (io) {
      emitCategoryUpdate(io, 'create', category);
    }

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);

    // Delete uploaded files if category creation fails
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.image[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      if (req.files.icon && req.files.icon[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.icon[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
    }

    // Handle duplicate name error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'A category with this name already exists'
      });
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
      message: 'An error occurred while creating the category'
    });
  }
};

/**
 * Update a category
 * PUT /api/categories/:id
 * Requires Manager role
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find category
    const category = await Category.findById(id);

    if (!category) {
      // Delete uploaded files if category not found
      if (req.files) {
        if (req.files.image && req.files.image[0]) {
          const filePath = path.join(__dirname, '../../uploads', req.files.image[0].filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        if (req.files.icon && req.files.icon[0]) {
          const filePath = path.join(__dirname, '../../uploads', req.files.icon[0].filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      }

      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    // Store old file paths for deletion
    const oldImageUrl = category.imageUrl;
    const oldIconUrl = category.iconUrl;

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;

    // Handle file uploads
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        
        // Validate file size (max 2MB)
        if (imageFile.size > 2 * 1024 * 1024) {
          // Delete uploaded file
          fs.unlinkSync(imageFile.path);
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Image size must be less than 2MB'
          });
        }
        
        // Read file and convert to base64
        const imageBuffer = await fsPromises.readFile(imageFile.path);
        const base64Image = imageBuffer.toString('base64');
        category.imageData = `data:${imageFile.mimetype};base64,${base64Image}`;
        
        // Delete temporary file
        fs.unlinkSync(imageFile.path);
        
        // Keep imageUrl for backward compatibility
        category.imageUrl = `/uploads/${imageFile.filename}`;

        // Delete old image file if it exists
        if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
          const oldFilePath = path.join(__dirname, '../../', oldImageUrl);
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Error deleting old file:', err);
          });
        }
      }

      if (req.files.icon && req.files.icon[0]) {
        category.iconUrl = `/uploads/${req.files.icon[0].filename}`;

        // Delete old icon file if it exists
        if (oldIconUrl && oldIconUrl.startsWith('/uploads/')) {
          const oldFilePath = path.join(__dirname, '../../', oldIconUrl);
          fs.unlink(oldFilePath, (err) => {
            if (err) console.error('Error deleting old file:', err);
          });
        }
      }
    }

    await category.save();

    // Emit category_update event via Socket.IO
    const io = getIO();
    if (io) {
      emitCategoryUpdate(io, 'update', category);
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'A category with this name already exists'
      });
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
        message: 'Invalid category ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while updating the category'
    });
  }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 * Requires Manager role
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete category
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    // Emit category_update event via Socket.IO
    const io = getIO();
    if (io) {
      emitCategoryUpdate(io, 'delete', category);
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);

    // Handle invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid category ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while deleting the category'
    });
  }
};
