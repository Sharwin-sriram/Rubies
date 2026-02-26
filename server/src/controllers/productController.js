import Product from '../models/Product.js';
import { asyncHandlerWrapper } from '../middleware/errorHandler.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandlerWrapper(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;

  // Build query
  const query = { isActive: true };

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Brand filter
  if (req.query.brand) {
    query.brand = { $regex: req.query.brand, $options: 'i' };
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.minRating) {
    // Rating filter removed - no reviews available
  }

  // Featured products filter
  if (req.query.featured === 'true') {
    query.featured = true;
  }

  // Sort options
  let sort = {};
  switch (req.query.sort) {
    case 'price-low':
      sort = { price: 1 };
      break;
    case 'price-high':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'name':
      sort = { name: 1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  // Execute query
  const products = await Product.find(query)
    .select('name price brand category images stock featured createdAt')
    .sort(sort)
    .skip(startIndex)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      count: products.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        search: req.query.search,
        category: req.query.category,
        brand: req.query.brand,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        featured: req.query.featured,
        sort: req.query.sort
      },
      data: products
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandlerWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not available'
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandlerWrapper(async (req, res) => {
  const productData = {
    ...req.body,
    images: req.files ? req.files.map(file => file.path) : []
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandlerWrapper(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const updateData = { ...req.body };

  // Handle image updates
  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map(file => file.path);
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandlerWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Soft delete - mark as inactive instead of removing
  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandlerWrapper(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;

  const products = await Product.find({ featured: true, isActive: true })
    .select('name price brand category images stock')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: {
      count: products.length,
      data: products
    }
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = asyncHandlerWrapper(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;

  const query = {
    category: req.params.category,
    isActive: true
  };

  const products = await Product.find(query)
    .select('name price brand category images stock featured')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      count: products.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: products
    }
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandlerWrapper(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get product brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = asyncHandlerWrapper(async (req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });

  res.status(200).json({
    success: true,
    data: brands
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = asyncHandlerWrapper(async (req, res) => {
  const { stock } = req.body;

  if (stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock cannot be negative'
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  product.stock = stock;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product stock updated successfully',
    data: {
      productId: product._id,
      stock: product.stock,
      isInStock: product.isInStock()
    }
  });
});

// @desc    Toggle product featured status
// @route   PUT /api/products/:id/featured
// @access  Private/Admin
export const toggleFeatured = asyncHandlerWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  product.featured = !product.featured;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.featured ? 'featured' : 'unfeatured'} successfully`,
    data: {
      productId: product._id,
      featured: product.featured
    }
  });
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
export const getProductStats = asyncHandlerWrapper(async (req, res) => {
  const stats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' },
        featuredProducts: {
          $sum: { $cond: ['$featured', 1, 0] }
        }
      }
    }
  ]);

  const categoryStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const brandStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalProducts: 0,
        totalStock: 0,
        averagePrice: 0,
        featuredProducts: 0
      },
      categories: categoryStats,
      brands: brandStats
    }
  });
});
