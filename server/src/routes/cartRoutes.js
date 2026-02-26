import express from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  getCartSummary
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';
import { validationErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

const mergeCartValidation = [
  body('guestCart')
    .isArray()
    .withMessage('Guest cart must be an array'),
  body('guestCart.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each cart item')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('guestCart.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each cart item')
];

// All cart routes are protected
router.use(protect);

// Cart routes
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/', addToCartValidation, validationErrorHandler, addToCart);
router.put('/:productId', updateCartItemValidation, validationErrorHandler, updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/merge', mergeCartValidation, validationErrorHandler, mergeCart);

export default router;
