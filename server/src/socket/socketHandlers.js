/**
 * Set up Socket.IO event handlers for a connected socket
 * @param {Server} io - Socket.IO server instance
 * @param {Socket} socket - Connected socket instance
 */
export const setupSocketHandlers = (io, socket) => {
  // Handle join_role event - join room based on user role
  socket.on('join_role', (data) => {
    const { role } = data || {};
    const userRole = role || socket.user.role;

    // Join role-based room
    const roomName = `role_${userRole.toLowerCase()}`;
    socket.join(roomName);

    console.log(`User ${socket.user.username} (${socket.user.role}) joined room: ${roomName}`);

    // Send confirmation
    socket.emit('joined_room', {
      room: roomName,
      role: userRole,
      message: `Successfully joined ${userRole} room`,
    });
  });

  // Handle order_acknowledged event (optional - for barista acknowledgment)
  socket.on('order_acknowledged', (data) => {
    const { orderId } = data;
    console.log(`Order ${orderId} acknowledged by ${socket.user.username}`);

    // Broadcast to managers if needed
    io.to('role_manager').emit('order_acknowledged', {
      orderId,
      acknowledgedBy: socket.user.username,
      timestamp: new Date(),
    });
  });

  // Handle generic disconnect
  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.user.username}:`, error);
  });
};

/**
 * Emit new_order event to barista and manager rooms
 * @param {Server} io - Socket.IO server instance
 * @param {Object} order - Order object
 */
export const emitNewOrder = (io, order) => {
  const orderData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    items: order.items.map(item => ({
      productName: item.productSnapshot.name,
      quantity: item.quantity,
      customizationNotes: item.customizationNotes,
      itemTotal: item.itemTotal,
    })),
    orderType: order.orderType,
    customerName: order.customerName,
    tableNumber: order.tableNumber,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
  };

  // Emit to barista and manager rooms
  io.to('role_barista').emit('new_order', orderData);
  io.to('role_manager').emit('new_order', orderData);

  console.log(`Emitted new_order event for order ${order.orderNumber}`);
};

/**
 * Emit update_order_status event to all relevant rooms
 * @param {Server} io - Socket.IO server instance
 * @param {Object} order - Updated order object
 */
export const emitOrderStatusUpdate = (io, order) => {
  const updateData = {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    completedAt: order.completedAt,
    updatedAt: new Date(),
  };

  // Emit to all role rooms (barista, cashier, manager)
  io.to('role_barista').emit('update_order_status', updateData);
  io.to('role_cashier').emit('update_order_status', updateData);
  io.to('role_manager').emit('update_order_status', updateData);

  console.log(`Emitted update_order_status event for order ${order.orderNumber} - Status: ${order.status}`);
};

/**
 * Emit product_update event to cashier and manager rooms
 * @param {Server} io - Socket.IO server instance
 * @param {string} action - Action type: 'create', 'update', or 'delete'
 * @param {Object} product - Product object
 */
export const emitProductUpdate = (io, action, product) => {
  const updateData = {
    action,
    productId: product._id.toString(),
    product: {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      stockCount: product.stockCount,
      lowStockThreshold: product.lowStockThreshold,
      isAvailable: product.isAvailable,
    },
    timestamp: new Date(),
  };

  // Emit to cashier and manager rooms
  io.to('role_cashier').emit('product_update', updateData);
  io.to('role_manager').emit('product_update', updateData);

  console.log(`Emitted product_update event - Action: ${action}, Product: ${product.name}`);
};

/**
 * Emit category_update event to cashier and manager rooms
 * @param {Server} io - Socket.IO server instance
 * @param {string} action - Action type: 'create', 'update', or 'delete'
 * @param {Object} category - Category object
 */
export const emitCategoryUpdate = (io, action, category) => {
  const updateData = {
    action,
    categoryId: category._id.toString(),
    category: {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
    },
    timestamp: new Date(),
  };

  // Emit to cashier and manager rooms
  io.to('role_cashier').emit('category_update', updateData);
  io.to('role_manager').emit('category_update', updateData);

  console.log(`Emitted category_update event - Action: ${action}, Category: ${category.name}`);
};
