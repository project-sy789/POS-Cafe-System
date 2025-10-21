import Settings from '../models/Settings.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get settings
 * GET /api/settings
 * Manager only
 */
export const getSettings = async (req, res) => {
  try {
    // Find settings document (there should only be one)
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({
        storeName: 'My Café',
        address: '',
        taxRate: 7,
        taxIncludedInPrice: false,
        promptPayId: '',
        promptPayType: 'phone',
        currency: 'THB'
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching settings'
    });
  }
};

/**
 * Update settings
 * PUT /api/settings
 * Manager only
 */
export const updateSettings = async (req, res) => {
  try {
    const { storeName, address, phone, taxRate, taxIncludedInPrice, promptPayId, promptPayType, currency, uiTheme, featuredCategory } = req.body;

    // Find existing settings or create new one
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings document
      settings = new Settings();
    }

    // Store old file paths for deletion
    const oldFaviconUrl = settings.faviconUrl;
    const oldLogoUrl = settings.logoUrl;

    // Update fields if provided
    if (storeName !== undefined) {
      settings.storeName = storeName;
    }

    if (address !== undefined) {
      settings.address = address;
    }

    if (phone !== undefined) {
      settings.phone = phone;
    }

    if (taxRate !== undefined) {
      // Validate tax rate
      if (taxRate < 0 || taxRate > 100) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Tax rate must be between 0 and 100'
        });
      }
      settings.taxRate = taxRate;
    }

    if (taxIncludedInPrice !== undefined) {
      settings.taxIncludedInPrice = taxIncludedInPrice;
    }

    if (promptPayId !== undefined) {
      settings.promptPayId = promptPayId;
    }

    if (promptPayType !== undefined) {
      const validTypes = ['phone', 'nationalId', 'taxId'];
      if (!validTypes.includes(promptPayType)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid PromptPay type. Must be phone, nationalId, or taxId'
        });
      }
      settings.promptPayType = promptPayType;
    }

    if (currency !== undefined) {
      settings.currency = currency;
    }

    // Handle uiTheme updates
    if (uiTheme !== undefined) {
      const validThemes = ['default', 'minimal'];
      if (!validThemes.includes(uiTheme)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'UI theme must be "default" or "minimal"'
        });
      }
      settings.uiTheme = uiTheme;
    }

    // Handle featuredCategory updates
    if (featuredCategory !== undefined) {
      // Validate mode
      if (featuredCategory.mode !== undefined) {
        const validModes = ['all', 'featured', 'hidden'];
        if (!validModes.includes(featuredCategory.mode)) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Featured category mode must be "all", "featured", or "hidden"'
          });
        }
        settings.featuredCategory.mode = featuredCategory.mode;
      }

      // Validate and update label
      if (featuredCategory.label !== undefined) {
        const trimmedLabel = featuredCategory.label.trim();
        if (trimmedLabel.length > 20) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Featured category label cannot exceed 20 characters'
          });
        }
        settings.featuredCategory.label = trimmedLabel;
      }

      // Update icon
      if (featuredCategory.icon !== undefined) {
        settings.featuredCategory.icon = featuredCategory.icon.trim();
      }
    }

    // Handle favicon upload - convert to base64
    if (req.files && req.files.favicon && req.files.favicon[0]) {
      const faviconFile = req.files.favicon[0];
      
      // Validate file size (max 500KB for favicon)
      if (faviconFile.size > 500 * 1024) {
        fs.unlinkSync(faviconFile.path);
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Favicon size must be less than 500KB'
        });
      }
      
      // Read file and convert to base64
      const faviconBuffer = await fsPromises.readFile(faviconFile.path);
      const base64Favicon = faviconBuffer.toString('base64');
      settings.faviconData = `data:${faviconFile.mimetype};base64,${base64Favicon}`;
      
      // Delete temporary file
      fs.unlinkSync(faviconFile.path);
      
      // Keep faviconUrl for backward compatibility
      settings.faviconUrl = `/uploads/${faviconFile.filename}`;

      // Delete old favicon file if it exists
      if (oldFaviconUrl && oldFaviconUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', oldFaviconUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old favicon:', err);
        });
      }
    }

    // Handle logo upload - convert to base64
    if (req.files && req.files.logo && req.files.logo[0]) {
      const logoFile = req.files.logo[0];
      
      // Validate file size (max 1MB for logo)
      if (logoFile.size > 1024 * 1024) {
        fs.unlinkSync(logoFile.path);
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Logo size must be less than 1MB'
        });
      }
      
      // Read file and convert to base64
      const logoBuffer = await fsPromises.readFile(logoFile.path);
      const base64Logo = logoBuffer.toString('base64');
      settings.logoData = `data:${logoFile.mimetype};base64,${base64Logo}`;
      
      // Delete temporary file
      fs.unlinkSync(logoFile.path);
      
      // Keep logoUrl for backward compatibility
      settings.logoUrl = `/uploads/${logoFile.filename}`;

      // Delete old logo file if it exists
      if (oldLogoUrl && oldLogoUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', oldLogoUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old logo:', err);
        });
      }
    }

    // Handle featured icon upload
    if (req.files && req.files.featuredIcon && req.files.featuredIcon[0]) {
      const oldIconUrl = settings.featuredCategory.iconUrl;
      settings.featuredCategory.iconUrl = `/uploads/${req.files.featuredIcon[0].filename}`;

      // Delete old icon file if it exists
      if (oldIconUrl && oldIconUrl.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '../../', oldIconUrl);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old featured icon:', err);
        });
      }
    }

    // Save settings (updatedAt will be set by pre-save hook)
    await settings.save();

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);

    // Delete uploaded files if update fails
    if (req.files) {
      if (req.files.favicon && req.files.favicon[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.favicon[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      if (req.files.logo && req.files.logo[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.logo[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      if (req.files.featuredIcon && req.files.featuredIcon[0]) {
        const filePath = path.join(__dirname, '../../uploads', req.files.featuredIcon[0].filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
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
      message: 'An error occurred while updating settings'
    });
  }
};
