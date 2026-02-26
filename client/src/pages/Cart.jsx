import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '@iconify/react';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const { items, summary, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    await updateCartItem(productId, newQuantity);
    setUpdating(prev => ({ ...prev, [productId]: false }));
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Icon icon="lucide:shopping-cart" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any headphones to your cart yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Continue Shopping
            <Icon icon="lucide:arrow-right" className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">
          {summary.totalItems} {summary.totalItems === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                  {item.productId.images && item.productId.images.length > 0 ? (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId._id}`}
                    className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {item.productId.name}
                  </Link>
                  <p className="text-sm text-gray-600">{item.productId.brand}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.productId.category}</p>
                  
                  {/* Price */}
                  <div className="mt-2">
                    <span className="text-lg font-semibold text-primary-600">
                      ₹{item.productId.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Quantity and Remove */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating[item.productId._id]}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon icon="lucide:minus" className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)}
                      disabled={item.quantity >= item.productId.stock || updating[item.productId._id]}
                      className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon icon="lucide:plus" className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveItem(item.productId._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Item Total */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Subtotal ({item.quantity} × ₹{item.productId.price.toLocaleString('en-IN')})
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{(item.productId.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart Button */}
          <div className="flex justify-end">
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{summary.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {summary.totalPrice > 100 ? 'Free' : '₹10'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">
                  ₹{(summary.totalPrice * 0.1).toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-base font-semibold text-primary-600">
                    {summary.formattedTotalPrice}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors duration-200"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
              
              <Link
                to="/shop"
                className="block w-full text-center bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Free shipping on orders over ₹100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
