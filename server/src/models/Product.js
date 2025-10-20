import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  stockCount: {
    type: Number,
    default: 0,
    min: [0, 'Stock count cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  customizationOptions: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  options: [{
    groupName: {
      type: String,
      required: [true, 'Option group name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['single', 'multiple'],
        message: 'Option type must be either single or multiple'
      },
      default: 'single'
    },
    required: {
      type: Boolean,
      default: false
    },
    values: [{
      name: {
        type: String,
        required: [true, 'Option value name is required'],
        trim: true
      },
      priceModifier: {
        type: Number,
        default: 0
      },
      iconUrl: {
        type: String,
        default: ''
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
productSchema.index({ category: 1 });
productSchema.index({ name: 'text' }); // Text search index

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
