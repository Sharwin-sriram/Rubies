import User from '../models/User.js';
import Product from '../models/Product.js';
import { asyncHandlerWrapper } from '../middleware/errorHandler.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandlerWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images stock brand category ratings isActive'
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Filter out inactive products and check stock
  const validCartItems = user.cart.filter(item => {
    return item.product && item.product.isActive && item.product.stock > 0;
  });

  // Update user's cart with valid items only
  user.cart = validCartItems.map(item => ({
    product: item.product._id,
    quantity: item.quantity
  }));
  await user.save();

  // Recalculate cart with populated products
  const updatedUser = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images stock brand category ratings isActive'
  });

  // Calculate cart totals
  const cartTotal = updatedUser.cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartTotalItems = updatedUser.cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      items: updatedUser.cart,
      summary: {
        totalItems: cartTotalItems,
        totalPrice: cartTotal,
        formattedTotalPrice: `₹${cartTotal.toFixed(2)}`
      }
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandlerWrapper(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  if (quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be at least 1'
    });
  }

  // Check if product exists and is active
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Product is not available'
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock. Only ${product.stock} items available`
    });
  }

  // Get user and add to cart
  const user = await User.findById(req.user._id);
  await user.addToCart(productId, quantity);

  // Get updated cart with populated products
  const updatedUser = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images stock brand category ratings'
  });

  // Calculate cart totals
  const cartTotal = updatedUser.cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartTotalItems = updatedUser.cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    data: {
      items: updatedUser.cart,
      summary: {
        totalItems: cartTotalItems,
        totalPrice: cartTotal,
        formattedTotalPrice: `₹${cartTotal.toFixed(2)}`
      }
    }
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandlerWrapper(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive number'
    });
  }

  // Check if product exists and has enough stock
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Product is not available'
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock. Only ${product.stock} items available`
    });
  }

  // Update cart item quantity
  const user = await User.findById(req.user._id);
  await user.updateCartItemQuantity(productId, quantity);

  // Get updated cart
  const updatedUser = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images stock brand category ratings'
  });

  // Calculate cart totals
  const cartTotal = updatedUser.cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartTotalItems = updatedUser.cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    message: 'Cart item updated successfully',
    data: {
      items: updatedUser.cart,
      summary: {
        totalItems: cartTotalItems,
        totalPrice: cartTotal,
        formattedTotalPrice: `₹${cartTotal.toFixed(2)}`
      }
    }
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandlerWrapper(async (req, res) => {
  const { productId } = req.params;

  // Remove item from cart
  const user = await User.findById(req.user._id);
  await user.removeFromCart(productId);

  // Get updated cart
  const updatedUser = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images stock brand category ratings'
  });

  // Calculate cart totals
  const cartTotal = updatedUser.cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartTotalItems = updatedUser.cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully',
    data: {
      items: updatedUser.cart,
      summary: {
        totalItems: cartTotalItems,
        totalPrice: cartTotal,
        formattedTotalPrice: `₹${cartTotal.toFixed(2)}`
      }
    }
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandlerWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  await user.clearCart();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      items: [],
      summary: {
        totalItems: 0,
        totalPrice: 0,
        formattedTotalPrice: '₹0.00'
      }
    }
  });
});

// @desc    Merge cart (for guest users or when logging in)
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = asyncHandlerWrapper(async (req, res) => {
  const { guestCart } = req.body;

  if (!guestCart || !Array.isArray(guestCart)) {
    return res.status(400).json({
      success: false,
      message: 'Guest cart data is required'
    });
  }

  const user = await User.findById(req.user._id);

  // Process each item from guest cart
  for (const guestItem of guestCart) {
    const { productId, quantity } = guestItem;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive || product.stock < quantity) {
      continue; // Skip invalid items
    }

    // Check if item already exists in user's cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      if (product.stock >= newQuantity) {
        user.cart[existingItemIndex].quantity = newQuantity;
      }
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity });
    }
  }

  await user.save();

  // Get updated cart with populated products
  const updatedUser = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'name price images stock brand category ratings'
  });

  // Calculate cart totals
  const cartTotal = updatedUser.cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartTotalItems = updatedUser.cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    message: 'Cart merged successfully',
    data: {
      items: updatedUser.cart,
      summary: {
        totalItems: cartTotalItems,
        totalPrice: cartTotal,
        formattedTotalPrice: `₹${cartTotal.toFixed(2)}`
      }
    }
  });
});

// @desc    Get cart summary (totals only)
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = asyncHandlerWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'price stock isActive'
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Filter out invalid items
  const validCartItems = user.cart.filter(item => {
    return item.product && item.product.isActive && item.product.stock > 0;
  });

  // Calculate totals
  const cartTotal = validCartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const cartTotalItems = validCartItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      totalItems: cartTotalItems,
      totalPrice: cartTotal,
      formattedTotalPrice: `₹${cartTotal.toFixed(2)}`
    }
  });
});
