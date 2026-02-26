import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  image: {
    type: String,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'debit-card', 'paypal', 'stripe', 'cash-on-delivery'],
    default: 'cash-on-delivery'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  trackingNumber: String,
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.itemsPrice = this.orderItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );
  
  // Calculate tax (10% for example)
  this.taxPrice = this.itemsPrice * 0.1;
  
  // Calculate shipping (free shipping for orders over ₹100)
  this.shippingPrice = this.itemsPrice > 100 ? 0 : 10;
  
  // Calculate total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  
  return this.save();
};

// Mark order as delivered
orderSchema.methods.markAsDelivered = function(trackingNumber) {
  this.status = 'delivered';
  this.isDelivered = true;
  this.deliveredAt = new Date();
  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }
  return this.save();
};

// Update order status
orderSchema.methods.updateStatus = function(status) {
  if (this.status === 'cancelled') {
    throw new Error('Cannot update cancelled order');
  }
  
  this.status = status;
  
  if (status === 'shipped') {
    this.paymentStatus = 'paid';
  }
  
  return this.save();
};

// Cancel order
orderSchema.methods.cancelOrder = function(reason) {
  if (this.status === 'shipped' || this.status === 'delivered') {
    throw new Error('Cannot cancel shipped or delivered order');
  }
  
  this.status = 'cancelled';
  if (reason) {
    this.notes = reason;
  }
  
  return this.save();
};

// Virtual for formatted total price
orderSchema.virtual('formattedTotalPrice').get(function() {
  return `₹${this.totalPrice.toFixed(2)}`;
});

// Ensure virtual fields are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
