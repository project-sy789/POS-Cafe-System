import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    default: 'My Café',
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  taxRate: {
    type: Number,
    required: [true, 'Tax rate is required'],
    default: 7, // 7% VAT in Thailand
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxIncludedInPrice: {
    type: Boolean,
    default: false, // false = tax is added on top, true = tax is included in price
    required: true
  },
  promptPayId: {
    type: String,
    required: [true, 'PromptPay ID is required'],
    trim: true
    // Thai phone number or National ID/Tax ID
  },
  promptPayType: {
    type: String,
    enum: {
      values: ['phone', 'nationalId', 'taxId'],
      message: '{VALUE} is not a valid PromptPay type'
    },
    default: 'phone'
  },
  currency: {
    type: String,
    default: 'THB',
    trim: true
  },
  faviconUrl: {
    type: String,
    default: '',
    trim: true
  },
  faviconData: {
    type: String,
    default: ''
  },
  logoUrl: {
    type: String,
    default: '',
    trim: true
  },
  logoData: {
    type: String,
    default: ''
  },
  featuredCategory: {
    mode: {
      type: String,
      enum: {
        values: ['all', 'featured', 'hidden'],
        message: '{VALUE} is not a valid featured category mode'
      },
      default: 'all'
    },
    label: {
      type: String,
      default: 'ทั้งหมด',
      maxlength: [20, 'Featured category label cannot exceed 20 characters'],
      trim: true
    },
    icon: {
      type: String,
      default: '🏪',
      trim: true
    },
    iconUrl: {
      type: String,
      default: '',
      trim: true
    }
  },
  uiTheme: {
    type: String,
    enum: {
      values: ['default', 'minimal'],
      message: '{VALUE} is not a valid UI theme'
    },
    default: 'default'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
