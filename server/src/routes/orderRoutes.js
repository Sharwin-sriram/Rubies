import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validationErrorHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('orderItems.*.product')
    .notEmpty()
    .withMessage('Product ID is required for each order item')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('orderItems.*.name')
    .notEmpty()
    .withMessage('Product name is required for each order item'),
  body('orderItems.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number for each order item'),
  body('orderItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each order item'),
  body('orderItems.*.image')
    .notEmpty()
    .withMessage('Product image is required for each order item'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('paymentMethod')
    .isIn(['credit-card', 'debit-card', 'paypal', 'stripe', 'cash-on-delivery'])
    .withMessage('Invalid payment method')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('trackingNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tracking number cannot be empty')
];

const updatePaymentStatusValidation = [
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status')
];

// All order routes are protected
router.use(protect);

// User routes
router.post('/', createOrderValidation, validationErrorHandler, createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin only routes
router.get('/', authorize('admin'), getOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatusValidation, validationErrorHandler, updateOrderStatus);
router.put('/:id/payment', authorize('admin'), updatePaymentStatusValidation, validationErrorHandler, updatePaymentStatus);
router.get('/stats/dashboard', authorize('admin'), getOrderStats);

export default router;
