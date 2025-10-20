import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
    // Format: ORD-YYYYMMDD-XXXX
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productSnapshot: {
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      imageUrl: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    customizationNotes: {
      type: String,
      default: ''
    },
    selectedOptions: [{
      groupName: {
        type: String,
        required: true
      },
      values: [{
        name: {
          type: String,
          required: true
        },
        priceModifier: {
          type: Number,
          default: 0
        }
      }]
    }],
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Base price cannot be negative']
    },
    optionsTotal: {
      type: Number,
      default: 0
    },
    itemPrice: {
      type: Number,
      required: true,
      min: [0, 'Item price cannot be negative']
    },
    itemTotal: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Cash', 'QRCode'],
      message: '{VALUE} is not a valid payment method'
    },
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },
  customerName: {
    type: String,
    default: '',
    trim: true
  },
  tableNumber: {
    type: String,
    default: '',
    trim: true
  },
  orderType: {
    type: String,
    enum: {
      values: ['Dine-In', 'Take Away'],
      message: '{VALUE} is not a valid order type'
    },
    required: true
  },
  cashReceived: {
    type: Number,
    default: 0,
    min: [0, 'Cash received cannot be negative']
  },
  changeGiven: {
    type: Number,
    default: 0,
    min: [0, 'Change given cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Indexes for efficient queries
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 }); // Single index for status filtering
orderSchema.index({ status: 1, createdAt: -1 }); // Compound index for best-sellers query optimization

// Static method to generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Find the last order of the day
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^ORD-${dateStr}-`)
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = String(sequence).padStart(4, '0');
  return `ORD-${dateStr}-${sequenceStr}`;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
