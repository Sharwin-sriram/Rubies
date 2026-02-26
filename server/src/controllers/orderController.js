import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { asyncHandlerWrapper } from '../middleware/errorHandler.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandlerWrapper(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    notes
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No order items provided'
    });
  }

  // Validate order items and check stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.product}`
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product is not available: ${product.name}`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Only ${product.stock} available`
      });
    }
  }

  // Calculate prices
  const itemsPrice = orderItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );

  const taxPrice = itemsPrice * 0.1; // 10% tax
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over ₹100
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    notes
  });

  // Decrease product stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }
    );
  }

  // Clear user's cart
  const user = await User.findById(req.user._id);
  await user.clearCart();

  // Populate order details for response
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder
  });
});

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandlerWrapper(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const query = { user: req.user._id };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  const orders = await Order.find(query)
    .populate('orderItems.product', 'name images')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandlerWrapper(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images description');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns the order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this order'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandlerWrapper(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  const query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: orders
  });
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandlerWrapper(async (req, res) => {
  const { status, trackingNumber } = req.body;

  if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  await order.updateStatus(status);

  if (status === 'shipped' && trackingNumber) {
    order.trackingNumber = trackingNumber;
    await order.save();
  }

  if (status === 'delivered') {
    await order.markAsDelivered(trackingNumber);
  }

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: updatedOrder
  });
});

// @desc    Update payment status (Admin only)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = asyncHandlerWrapper(async (req, res) => {
  const { paymentStatus, paymentResult } = req.body;

  if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment status'
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  order.paymentStatus = paymentStatus;

  if (paymentResult) {
    order.paymentResult = paymentResult;
  }

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    data: updatedOrder
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandlerWrapper(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user owns the order or is admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order'
    });
  }

  await order.cancelOrder(reason);

  // Restore product stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: updatedOrder
  });
});

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandlerWrapper(async (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        paidOrders: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        }
      }
    }
  ]);

  // Daily sales trend
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        totalSold: 1,
        revenue: 1
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        paidOrders: 0
      },
      dailySales,
      topProducts
    }
  });
});
