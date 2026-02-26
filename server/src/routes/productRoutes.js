import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getCategories,
  getBrands,
  updateProductStock,
  toggleFeatured,
  getProductStats
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadMultiple } from '../config/multer.js';
import { validationErrorHandler } from '../middleware/errorHandler.js';
import { uploadLimiter } from '../middleware/security.js';

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  body('category')
    .isIn(['over-ear', 'on-ear', 'in-ear', 'wireless', 'gaming', 'noise-cancelling', 'sports', 'studio'])
    .withMessage('Invalid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  body('category')
    .optional()
    .isIn(['over-ear', 'on-ear', 'in-ear', 'wireless', 'gaming', 'noise-cancelling', 'sports', 'studio'])
    .withMessage('Invalid category'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const updateStockValidation = [
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', protect, authorize('admin'), uploadLimiter, uploadMultiple, createProductValidation, validationErrorHandler, createProduct);
router.put('/:id', protect, authorize('admin'), uploadLimiter, uploadMultiple, updateProductValidation, validationErrorHandler, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.put('/:id/stock', protect, authorize('admin'), updateStockValidation, validationErrorHandler, updateProductStock);
router.put('/:id/featured', protect, authorize('admin'), toggleFeatured);
router.get('/stats/dashboard', protect, authorize('admin'), getProductStats);

export default router;
