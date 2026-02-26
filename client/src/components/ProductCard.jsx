import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product._id, 1);
  };

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative overflow-hidden h-64">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {product.featured && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Featured
            </div>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-red-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">{product.brand}</p>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-bold text-red-600">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>

          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
