import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config.js";
import { ArrowLeft, ChevronRight } from 'lucide-react';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Images, 2: Details, 3: Location
  const [product, setProduct] = useState({
    title: '',
    description: '',
    city: '',
    location: '',
    return_policy: '',
    size: '',
    type: 'casual',
    price: '',
    category: 'buy',
    user_id: '1',
    images: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelection = (e) => {
    try {
      const files = Array.from(e.target.files);
      const imageURIs = files.map(file => ({
        uri: URL.createObjectURL(file),
        file: file
      }));
      
      setProduct(prev => ({
        ...prev,
        images: [...prev.images, ...imageURIs]
      }));
      
      console.log('Images selected:', imageURIs);
    } catch (error) {
      console.error('Image selection error:', error);
      alert('Failed to select image');
    }
  };

  const removeImage = (indexToRemove) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const createFormData = () => {
    const formData = new FormData();
  
    // Add all non-image fields
    Object.keys(product).forEach((key) => {
      if (key !== 'images') {
        formData.append(key, product[key].toString());
      }
    });
  
    // Properly append each image
    product.images.forEach((imageData) => {
      const file = imageData.file;
      formData.append('images', file);
    });
  
    return formData;
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1: // Images
        if (product.images.length === 0) return 'At least one image is required';
        break;
      case 2: // Details
        if (!product.title.trim()) return 'Title is required';
        if (!product.price.trim()) return 'Price is required';
        if (isNaN(parseFloat(product.price))) return 'Price must be a number';
        break;
      case 3: // Location
        // Optional validation for location if needed
        break;
      default:
        break;
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      alert(validationError);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const formData = createFormData();

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.detail || 'Upload failed');
      }

      alert('Product uploaded successfully!');
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload Failed: Server error. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Images
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-amber-600">Upload Product Images</h2>
            <p className="text-amber-600">Add at least one image of your product</p>
            
            <div>
              <label className="block mb-2 font-medium text-amber-600">Product Images *</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {product.images.map((imageData, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={imageData.uri} 
                      alt={`Preview ${index}`} 
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 shadow-md"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <label className={`border-2 border-dashed flex items-center justify-center rounded-lg cursor-pointer h-48 shadow-md hover:shadow-lg transition-shadow ${product.images.length === 0 ? 'border-red-400' : 'border-amber-400'}`}>
                  <span className="text-4xl text-amber-500">+</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageSelection}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleNext}
                disabled={product.images.length === 0}
                className={`px-6 py-2 rounded-lg shadow-md flex items-center ${
                  product.images.length === 0 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        );
        
      case 2: // Details
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-amber-600">Product Details</h2>
            <p className="text-amber-600">Tell us more about your product</p>
            
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-amber-600">Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={product.title}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${!product.title ? 'border-red-400' : 'border-amber-300'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder="Product title"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-amber-600">Price *</label>
                <input 
                  type="text" 
                  name="price"
                  value={product.price}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${!product.price ? 'border-red-400' : 'border-amber-300'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 font-medium text-amber-600">Description</label>
              <textarea 
                name="description"
                value={product.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows="4"
                placeholder="Describe your product"
              />
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-amber-600">Category</label>
                <select 
                  name="category"
                  value={product.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-amber-600">Type</label>
                <select 
                  name="type"
                  value={product.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="bridal">Bridal</option>
                </select>
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block mb-2 font-medium text-amber-600">Size</label>
              <input 
                type="text" 
                name="size"
                value={product.size}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Product size"
              />
            </div>

            {/* Return Policy */}
            <div>
              <label className="block mb-2 font-medium text-amber-600">Return Policy</label>
              <input 
                type="text" 
                name="return_policy"
                value={product.return_policy}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Return policy details"
              />
            </div>

            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={handleBack}
                className="px-6 py-2 bg-amber-100 text-amber-800 rounded-lg shadow-md hover:bg-amber-200"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={handleNext}
                disabled={!product.title || !product.price}
                className={`px-6 py-2 rounded-lg shadow-md flex items-center ${
                  !product.title || !product.price
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        );
        
      case 3: // Location
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-amber-600">Location Information</h2>
            <p className="text-amber-600">Where is your product located?</p>
            
            {/* Location Details */}
            <div>
              <label className="block mb-2 font-medium text-amber-600">City</label>
              <input 
                type="text" 
                name="city"
                value={product.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="City"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-amber-600">Location</label>
              <input 
                type="text" 
                name="location"
                value={product.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Detailed location"
              />
            </div>

            <div className="flex justify-between mt-8">
              <button 
                type="button" 
                onClick={handleBack}
                className="px-6 py-2 bg-amber-100 text-amber-800 rounded-lg shadow-md hover:bg-amber-200"
              >
                Back
              </button>
              <button 
                type="submit" 
                onClick={handleUpload}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg shadow-md ${
                  isLoading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                {isLoading ? 'Uploading...' : 'List Product'}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Progress steps display
  const renderProgressSteps = () => {
    const steps = [
      { number: 1, title: 'Images' },
      { number: 2, title: 'Details' },
      { number: 3, title: 'Location' }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.number ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {step.number}
            </div>
            
            {/* Step title */}
            <div className="mx-2 text-sm font-medium text-amber-600">
              {step.title}
            </div>
            
            {/* Connector line (except after last step) */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-grow h-1 mx-2 ${
                  currentStep > step.number ? 'bg-amber-600' : 'bg-amber-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-amber-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-amber-900 border-b border-amber-600 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={handleBack}
            className="flex items-center text-amber-200 hover:text-amber-100 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>{currentStep > 1 ? 'Back' : 'Home'}</span>
          </button>
          <h1 className="text-xl font-bold text-amber-50 flex-1 text-center">Add New Product</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        {renderProgressSteps()}
        
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-200">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;