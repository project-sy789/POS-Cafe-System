import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import { emitNewOrder, emitOrderStatusUpdate } from '../socket/socketHandlers.js';
import { getIO } from '../server.js';

/**
 * POST /api/orders
 * Create a new order
 * Requires Cashier or Manager role
 */
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      customerName,
      tableNumber,
      orderType,
      paymentMethod,
      cashReceived,
      changeGiven
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Order must contain at least one item'
      });
    }

    if (!orderType) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Order type is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Payment method is required'
      });
    }

    // Get tax rate from settings
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        storeName: 'My Café',
        taxRate: 7,
        taxIncludedInPrice: false,
        promptPayId: '0000000000'
      });
    }

    const taxRate = settings.taxRate / 100;
    const taxIncludedInPrice = settings.taxIncludedInPrice || false;

    // Process items and create product snapshots
    const processedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.product || !item.quantity) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Each item must have a product ID and quantity'
        });
      }

      // Fetch product details
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Product with ID ${item.product} not found`
        });
      }

      // Check if product is available
      if (!product.isAvailable) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Product "${product.name}" is not available`
        });
      }

      // Check stock availability
      if (product.stockCount < item.quantity) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Insufficient stock for "${product.name}". Available: ${product.stockCount}, Requested: ${item.quantity}`
        });
      }

      // Calculate base price and options total
      const basePrice = product.price;
      let optionsTotal = 0;
      let selectedOptions = [];

      // Process selected options if provided
      if (item.selectedOptions && Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0) {
        selectedOptions = item.selectedOptions;

        // Validate selected options against product options
        for (const selectedGroup of selectedOptions) {
          // Find matching option group in product
          const productOptionGroup = product.options?.find(
            opt => opt.groupName === selectedGroup.groupName
          );

          if (!productOptionGroup) {
            return res.status(400).json({
              error: 'Validation Error',
              message: `Invalid option group "${selectedGroup.groupName}" for product "${product.name}"`
            });
          }

          // Validate selected values
          if (!selectedGroup.values || !Array.isArray(selectedGroup.values)) {
            return res.status(400).json({
              error: 'Validation Error',
              message: `Invalid option values for group "${selectedGroup.groupName}"`
            });
          }

          // Check if required option group has selections
          if (productOptionGroup.required && selectedGroup.values.length === 0) {
            return res.status(400).json({
              error: 'Validation Error',
              message: `Required option group "${selectedGroup.groupName}" must have at least one selection`
            });
          }

          // Validate each selected value and calculate price modifiers
          for (const selectedValue of selectedGroup.values) {
            const productOptionValue = productOptionGroup.values.find(
              val => val.name === selectedValue.name
            );

            if (!productOptionValue) {
              return res.status(400).json({
                error: 'Validation Error',
                message: `Invalid option value "${selectedValue.name}" in group "${selectedGroup.groupName}"`
              });
            }

            // Use server-side price modifier (prevent client tampering)
            optionsTotal += productOptionValue.priceModifier;
          }
        }
      }

      // Check for required options that are missing
      if (product.options && product.options.length > 0) {
        for (const productOption of product.options) {
          if (productOption.required) {
            const hasSelection = selectedOptions.some(
              opt => opt.groupName === productOption.groupName && opt.values.length > 0
            );
            if (!hasSelection) {
              return res.status(400).json({
                error: 'Validation Error',
                message: `Required option "${productOption.groupName}" is missing for product "${product.name}"`
              });
            }
          }
        }
      }

      // Calculate item price and total
      const itemPrice = basePrice + optionsTotal;
      const itemTotal = itemPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      // Create processed item with product snapshot
      const processedItem = {
        product: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        },
        quantity: item.quantity,
        customizationNotes: item.customizationNotes || '',
        selectedOptions: selectedOptions,
        basePrice: basePrice,
        optionsTotal: optionsTotal,
        itemPrice: itemPrice,
        itemTotal: itemTotal
      };

      processedItems.push(processedItem);
    }

    // Calculate tax and total based on tax settings
    let calculatedTax, calculatedTotal;
    
    if (taxIncludedInPrice) {
      // Tax is included in price
      // calculatedSubtotal already includes tax
      calculatedTotal = calculatedSubtotal;
      // Calculate tax backwards: tax = total - (total / (1 + taxRate))
      calculatedTax = calculatedSubtotal - (calculatedSubtotal / (1 + taxRate));
    } else {
      // Tax is added on top
      calculatedTax = calculatedSubtotal * taxRate;
      calculatedTotal = calculatedSubtotal + calculatedTax;
    }

    // Generate unique order number
    const orderNumber = await Order.generateOrderNumber();

    // Create order object
    const orderData = {
      orderNumber,
      items: processedItems,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      paymentMethod,
      orderType,
      customerName: customerName || '',
      tableNumber: tableNumber || '',
      createdBy: req.user._id
    };

    // Add cash payment details if applicable
    if (paymentMethod === 'Cash') {
      if (cashReceived < calculatedTotal) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Cash received is less than the total amount'
        });
      }
      orderData.cashReceived = cashReceived;
      orderData.changeGiven = changeGiven || (cashReceived - calculatedTotal);
    }

    // Create order
    const order = await Order.create(orderData);

    // Deduct stock for each item
    console.log('Deducting stock for order:', order.orderNumber);
    for (const item of processedItems) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockCount: -item.quantity } },
        { new: true }
      );
      console.log(`Stock updated for ${updatedProduct.name}: ${updatedProduct.stockCount + item.quantity} -> ${updatedProduct.stockCount}`);
    }

    // Populate product references
    await order.populate('createdBy', 'username role');

    // Emit new_order event via Socket.IO
    const io = getIO();
    if (io) {
      emitNewOrder(io, order);
      
      // Emit product_stock_changed event for real-time POS updates
      io.emit('product_stock_changed', {
        products: order.items.map(item => item.product)
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to create order'
    });
  }
};

/**
 * GET /api/orders
 * Get all orders with optional filtering
 * Requires authentication
 */
export const getOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, paymentMethod } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Fetch orders with filters
    const orders = await Order.find(filter)
      .populate('createdBy', 'username role')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch orders'
    });
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID
 * Requires authentication
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('createdBy', 'username role')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch order'
    });
  }
};

/**
 * PUT /api/orders/:id/status
 * Update order status
 * Requires Barista or Manager role
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Store old status for comparison
    const oldStatus = order.status;

    // Update status
    order.status = status;

    // Set completedAt timestamp if status is Completed
    if (status === 'Completed' && !order.completedAt) {
      order.completedAt = new Date();
    }

    // Restore stock if order is cancelled (and wasn't already cancelled)
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      console.log('Restoring stock for cancelled order:', order.orderNumber);
      for (const item of order.items) {
        const productId = item.product._id || item.product;
        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          { $inc: { stockCount: item.quantity } },
          { new: true }
        );
        if (updatedProduct) {
          console.log(`Stock restored for product ${productId}: ${updatedProduct.stockCount - item.quantity} -> ${updatedProduct.stockCount}`);
        }
      }
    }

    await order.save();

    // Populate references
    await order.populate('createdBy', 'username role');
    await order.populate('items.product', 'name');

    // Emit update_order_status event via Socket.IO
    const io = getIO();
    if (io) {
      emitOrderStatusUpdate(io, order);
      
      // Emit product_stock_changed event when order is cancelled (restore stock)
      if (status === 'Cancelled') {
        io.emit('product_stock_changed', {
          products: order.items.map(item => item.product._id || item.product)
        });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to update order status'
    });
  }
};

/**
 * GET /api/orders/reports/sales
 * Generate sales report with aggregated metrics
 * Requires Manager role
 */
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endDateTime;
      }
    }

    // Only count completed orders
    dateFilter.status = 'Completed';

    // Aggregate total revenue and order count
    const revenueStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Calculate top-selling products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productSnapshot.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.itemTotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productName: '$_id',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // Format response
    const report = {
      totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
      orderCount: revenueStats.length > 0 ? revenueStats[0].orderCount : 0,
      averageOrderValue: revenueStats.length > 0 ? revenueStats[0].averageOrderValue : 0,
      topProducts: topProducts,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to generate sales report'
    });
  }
};

/**
 * GET /api/orders/reports/export
 * Export orders to CSV file
 * Requires Manager role
 */
export const exportOrdersToCSV = async (req, res) => {
  try {
    const { startDate, endDate, status, paymentMethod } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Fetch orders with filters
    const orders = await Order.find(filter)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    // Generate CSV content
    const csvHeaders = [
      'Order Number',
      'Date',
      'Customer Name',
      'Table Number',
      'Order Type',
      'Items',
      'Subtotal',
      'Tax',
      'Total',
      'Payment Method',
      'Status',
      'Created By',
      'Completed At'
    ];

    const csvRows = orders.map(order => {
      // Format items as a string
      const itemsStr = order.items
        .map(item => `${item.productSnapshot.name} x${item.quantity}${item.customizationNotes ? ` (${item.customizationNotes})` : ''}`)
        .join('; ');

      return [
        order.orderNumber,
        new Date(order.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }),
        order.customerName || '',
        order.tableNumber || '',
        order.orderType,
        `"${itemsStr}"`, // Wrap in quotes to handle commas
        order.subtotal.toFixed(2),
        order.tax.toFixed(2),
        order.total.toFixed(2),
        order.paymentMethod,
        order.status,
        order.createdBy?.username || '',
        order.completedAt ? new Date(order.completedAt).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) : ''
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-export-${Date.now()}.csv"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting orders to CSV:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to export orders'
    });
  }
};
