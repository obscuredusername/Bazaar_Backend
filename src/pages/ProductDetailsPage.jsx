import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Mail, Phone, Copy, Edit, Save, X, Trash, Upload, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";

const ProductDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Accept both productId from state params and as an explicit prop
  const { productId } = location.state || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch product details
  const fetchProductDetails = async () => {
    if (!productId) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      const data = await response.json();
      setProduct(data);
      setEditedProduct(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Determine if we should start in edit mode based on location state
  useEffect(() => {
    if (location.state && location.state.editMode === true) {
      setIsEditMode(true);
    }
  }, [location.state]);

  // If loading or no product, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
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
            className="mt-4 bg-amber-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Process images - ensure we're using full URLs for images
  const productImages = isEditMode 
    ? [
        ...((editedProduct.images && editedProduct.images.length > 0) 
          ? editedProduct.images
            .filter(image => !imagesToDelete.includes(image))
            .map(image => {
              // Check if the image path already includes the API_BASE_URL
              if (image.startsWith('http')) {
                return image; // Already a full URL
              } else {
                // Append the API_BASE_URL if it's a relative path
                return `${API_BASE_URL}${image}`;
              }
            })
          : []),
        ...newImages.map(file => URL.createObjectURL(file))
      ]
    : ((product.images && product.images.length > 0) 
      ? product.images.map(image => {
          // Check if the image path already includes the API_BASE_URL
          if (image.startsWith('http')) {
            return image; // Already a full URL
          } else {
            // Append the API_BASE_URL if it's a relative path
            return `${API_BASE_URL}${image}`;
          }
        })
      : ['https://via.placeholder.com/500']);

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

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedProduct({...product});
    setNewImages([]);
    setImagesToDelete([]);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedProduct({...product});
    setNewImages([]);
    setImagesToDelete([]);
    setSaveError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleDeleteImage = (image) => {
    if (image.startsWith('blob:')) {
      // It's a new image, remove from newImages
      const fileName = image.split('/').pop();
      setNewImages(prev => prev.filter(file => URL.createObjectURL(file) !== image));
    } else {
      // It's an existing image, add to imagesToDelete
      const relativePath = image.replace(API_BASE_URL, '');
      setImagesToDelete(prev => [...prev, relativePath]);
    }
    // Reset current image index if needed
    if (currentImageIndex >= productImages.length - 1) {
      setCurrentImageIndex(Math.max(0, productImages.length - 2));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add product data - map to backend field names
      Object.keys(editedProduct).forEach(key => {
        if (key !== 'images' && key !== 'user') {
          formData.append(key, editedProduct[key]);
        }
      });
      
      // Add files to upload - match backend expectation for image field name
      newImages.forEach(file => {
        formData.append('images', file);
      });
      
      // Send update request to match backend API
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        body: formData,
        // Note: Don't set Content-Type header, browser will set it with boundary for FormData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      const updatedProduct = await response.json();
      setProduct(updatedProduct);
      setIsEditMode(false);
      
      // Show success message or notification here if needed
    } catch (error) {
      console.error('Error updating product:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen w-full bg-amber-50">
      <header className="sticky top-0 z-10 bg-amber-900 border-b border-amber-600 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-50">Product Details</h1>
          {isEditMode ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition-colors disabled:bg-green-300"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-500 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Image Carousel with Edit functionality */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative w-full max-w-md h-[400px] overflow-hidden rounded-xl shadow-lg bg-white">
            {productImages.length > 0 ? (
              <img
                src={productImages[currentImageIndex]}
                alt={`${editedProduct.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
            
            {/* Carousel Navigation */}
            {productImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="text-amber-800" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="text-amber-800" />
                </button>

                {/* Image Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {productImages.map((_, index) => (
                    <div 
                      key={index} 
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-amber-600' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Edit Image Controls */}
            {isEditMode && (
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <label className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                  <Plus className="w-5 h-5" />
                </label>
                
                {productImages.length > 0 && (
                  <button
                    onClick={() => handleDeleteImage(productImages[currentImageIndex])}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-400"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>Error: {saveError}</p>
          </div>
        )}

        {/* Product Information */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Details Column */}
          <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-amber-200">
            <div>
              {isEditMode ? (
                <input
                  type="text"
                  name="title"
                  value={editedProduct.title || ''}
                  onChange={handleInputChange}
                  className="w-full text-3xl md:text-4xl font-bold text-amber-900 mb-2 border-b border-amber-300 focus:outline-none focus:border-amber-500"
                />
              ) : (
                <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">{product.title}</h2>
              )}
              <div className="flex items-center space-x-2">
                {isEditMode ? (
                  <div className="flex items-center">
                    <span className="text-2xl text-amber-600">$</span>
                    <input
                      type="number"
                      name="price"
                      value={editedProduct.price || ''}
                      onChange={handleInputChange}
                      className="w-32 text-2xl text-amber-600 font-semibold border-b border-amber-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <span className="text-2xl text-amber-600 font-semibold">${product.price}</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-amber-800">Description</h3>
              {isEditMode ? (
                <textarea
                  name="description"
                  value={editedProduct.description || ''}
                  onChange={handleInputChange}
                  className="w-full h-32 text-amber-700 border border-amber-300 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              ) : (
                <p className="text-amber-700">
                  {product.description || `A stunning ${product.category} item perfect for your needs.`}
                </p>
              )}
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="text-lg font-semibold mb-2 text-amber-800">Product Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-amber-600">Category:</p>
                  {isEditMode ? (
                    <select
                      name="category"
                      value={editedProduct.category || ''}
                      onChange={handleInputChange}
                      className="w-full font-medium text-amber-900 border border-amber-300 rounded p-1 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select Category</option>
                      <option value="Rent">Rent</option>
                      <option value="Sale">Sale</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-medium text-amber-900">{product.category || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-amber-600">Location:</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="city"
                      value={editedProduct.city || ''}
                      onChange={handleInputChange}
                      className="w-full font-medium text-amber-900 border border-amber-300 rounded p-1 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="font-medium text-amber-900">{product.city || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-amber-600">Size:</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="size"
                      value={editedProduct.size || ''}
                      onChange={handleInputChange}
                      className="w-full font-medium text-amber-900 border border-amber-300 rounded p-1 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="font-medium text-amber-900">{product.size || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-amber-600">Type:</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="type"
                      value={editedProduct.type || ''}
                      onChange={handleInputChange}
                      className="w-full font-medium text-amber-900 border border-amber-300 rounded p-1 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="font-medium text-amber-900">{product.type || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-amber-600">Return Policy:</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="return_policy"
                      value={editedProduct.return_policy || ''}
                      onChange={handleInputChange}
                      className="w-full font-medium text-amber-900 border border-amber-300 rounded p-1 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="font-medium text-amber-900">{product.return_policy || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-amber-600">Location Details:</p>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="location"
                      value={editedProduct.location || ''}
                      onChange={handleInputChange}
                      className="w-full font-medium text-amber-900 border border-amber-300 rounded p-1 focus:outline-none focus:border-amber-500"
                    />
                  ) : (
                    <p className="font-medium text-amber-900">{product.location || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors shadow-md"
                disabled={isEditMode}
              >
                {product.category === 'Rent' ? 'Rent Now' : 'Purchase Now'}
              </button>
            </div>
          </div>

          {/* Seller Details Column */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-200">
            <div className="flex items-center mb-6">
              <img 
                src={product.user?.avatar || "https://via.placeholder.com/100"} 
                alt="Seller Avatar" 
                className="w-16 h-16 md:w-20 md:h-20 rounded-full mr-4 object-cover border-2 border-amber-300"
              />
              <div>
                <h3 className="text-xl font-bold text-amber-900">{product.user?.username || 'Unknown'}</h3>
                <p className="text-amber-600">Verified Seller</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t border-amber-200 pt-4">
                <h4 className="text-lg font-semibold mb-3 text-amber-800">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-amber-600" />
                    <span className="text-amber-700">{product.user?.email || 'N/A'}</span>
                    <button 
                      onClick={() => copyToClipboard(product.user?.email, 'email')}
                      className="ml-2 p-1 hover:bg-amber-100 rounded transition-colors"
                      title="Copy email"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                    {copiedEmail && (
                      <span className="text-xs text-green-600 ml-2">Copied!</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-amber-600" />
                    <span className="text-amber-700">{product.user?.contact_no || 'N/A'}</span>
                    <button 
                      onClick={() => copyToClipboard(product.user?.contact_no, 'phone')}
                      className="ml-2 p-1 hover:bg-amber-100 rounded transition-colors"
                      title="Copy phone number"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </button>
                    {copiedPhone && (
                      <span className="text-xs text-green-600 ml-2">Copied!</span>
                    )}
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