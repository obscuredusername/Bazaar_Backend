import React from 'react';

const ProductCard = ({ product, onLikeClick }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Product image */}
      <div className="relative">
        <img
          src={product.thumbnail || 'https://via.placeholder.com/300'} // Default placeholder
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div
          className={`absolute top-0 right-0 bg-teal-600 text-white text-xs px-2 py-1 m-2 rounded-full`}
        >
          {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
        </div>
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-2">Price: ${product.price}</p>

        {/* Like button */}
        <button
          onClick={onLikeClick}
          className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
        >
          ❤️ Like
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
