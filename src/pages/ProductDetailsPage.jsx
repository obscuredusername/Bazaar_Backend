import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, ChevronRight, Star, MessageCircle, Mail, Phone } from 'lucide-react';
import API_BASE_URL from "../config";

const ProductDetailsPage = ({ productId, onBack }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch product details
  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // If loading or no product, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If error, show error state
  if (error || !product) {
    return (
      <div className="h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-500 mb-4">Error Loading Product</h2>
          <p>{error}</p>
          <button 
            onClick={fetchProductDetails} 
            className="mt-4 bg-teal-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Process images - ensure we're using full URLs for images
  const productImages = product.images && product.images.length > 0 
    ? product.images.map(image => {
        // Check if the image path already includes the API_BASE_URL
        if (image.startsWith('http')) {
          return image; // Already a full URL
        } else {
          // Append the API_BASE_URL if it's a relative path
          return `${API_BASE_URL}${image}`;
        }
      })
    : ['https://via.placeholder.com/500'];

  // Debug log the image URLs
  console.log("Image URLs:", productImages);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      (prev + 1) % productImages.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="h-screen w-640 bg-white">
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-teal-600">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center text-white hover:text-teal-400 transition-colors"
          >
            <ChevronLeft className="mr-2" />
            Back to Products
          </button>
          <h1 className="text-2xl font-bold text-white">Product Details</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Image Carousel */}
        <div className="relative mb-8">
          <div className="relative w-full h-[500px] overflow-hidden rounded-xl shadow-lg">
            <img
              src={productImages[currentImageIndex]}
              alt={`${product.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Carousel Navigation */}
            {productImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight />
                </button>

                {/* Image Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {productImages.map((_, index) => (
                    <div 
                      key={index} 
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-teal-600' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Details Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{product.title}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-2xl text-teal-600 font-semibold">${product.price}</span>
                <div className="flex items-center text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < 4 ? 'fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-gray-600 ml-2 text-sm">(No reviews)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">
                {product.description || `A stunning ${product.category} item perfect for your needs.`}
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Product Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-600">Category:</p>
                  <p className="font-medium">{product.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location:</p>
                  <p className="font-medium">{product.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Size:</p>
                  <p className="font-medium">{product.size || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Type:</p>
                  <p className="font-medium">{product.type || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {product.category === 'Rent' ? 'Rent Now' : 'Add to Cart'}
              </button>
              <button 
                className="flex-1 px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
              >
                {product.category === 'Rent' ? 'Check Availability' : 'Add to Wishlist'}
              </button>
            </div>
          </div>

          {/* Seller Details Column */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <img 
                src={product.user?.avatar || "https://via.placeholder.com/100"} 
                alt="Seller Avatar" 
                className="w-20 h-20 rounded-full mr-4 object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">{product.user?.username || 'Unknown'}</h3>
                <p className="text-gray-600">Verified Seller</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" />
                <span className="text-gray-700">{product.user?.rating || 'N/A'} Seller Rating</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-teal-600" />
                    <span>{product.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-teal-600" />
                    <span>{product.user?.contact_no || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-teal-600" />
                    <span>Chat with Seller</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold mb-3">Seller Statistics</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">-</p>
                    <p className="text-sm text-gray-600">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">{product.user?.rating}%</p>
                    <p className="text-sm text-gray-600">Positive Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">
                      {product.user?.joining_date ? Math.floor((new Date() - new Date(product.user.joining_date)) / (365.25 * 24 * 60 * 60 * 1000)) : '0'}y
                    </p>
                    <p className="text-sm text-gray-600">On Platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailsPage;