import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        summary: action.payload.summary || {
          totalItems: 0,
          totalPrice: 0,
          formattedTotalPrice: '₹0.00',
        },
        loading: false,
      };
    case 'ADD_TO_CART_START':
      return { ...state, loading: true };
    case 'ADD_TO_CART_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
        loading: false,
      };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        summary: {
          totalItems: 0,
          totalPrice: 0,
          formattedTotalPrice: '₹0.00',
        },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  summary: {
    totalItems: 0,
    totalPrice: 0,
    formattedTotalPrice: '₹0.00',
  },
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await cartAPI.get();
      dispatch({ type: 'SET_CART', payload: response.data.data });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Don't throw error, just log it to prevent app from breaking
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      dispatch({ type: 'ADD_TO_CART_START' });
      const response = await cartAPI.add({ productId, quantity });
      dispatch({ type: 'ADD_TO_CART_SUCCESS', payload: response.data.data });
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await cartAPI.update(productId, quantity);
      dispatch({ type: 'UPDATE_CART_ITEM', payload: response.data.data });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartAPI.remove(productId);
      dispatch({ type: 'REMOVE_FROM_CART', payload: response.data.data });
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
