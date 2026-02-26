import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price cannot be negative']
  },
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'over-ear',
      'on-ear',
      'in-ear',
      'wireless',
      'gaming',
      'noise-cancelling',
      'sports',
      'studio'
    ]
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create index for search functionality
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

// Check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stock >= quantity;
};

// Decrease stock
productSchema.methods.decreaseStock = function(quantity) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return this.save();
  }
  throw new Error('Insufficient stock');
};

// Increase stock
productSchema.methods.increaseStock = function(quantity) {
  this.stock += quantity;
  return this.save();
};

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

// Ensure virtual fields are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
