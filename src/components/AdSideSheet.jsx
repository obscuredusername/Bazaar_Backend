import React, { useState, useEffect, useRef } from 'react';
import { X, Edit, Trash, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";

const AdsSideSheet = ({ isOpen, onClose, ads }) => {
  const sideSheetRef = useRef(null);
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sideSheetRef.current && !sideSheetRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent background scrolling when side sheet is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Helper function to handle image path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const handleView = (adId) => {
    navigate(`/post`, {
      state: {productId: adId}
    });
    onClose();
  };
  
  // Delete a product
const handleDelete = async (productId) => {
  try {
    // Check if API_BASE_URL is properly configured
    if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === '') {
      console.error('API_BASE_URL is not properly configured:', API_BASE_URL);
      alert('Server configuration error. Please contact support.');
      return false;
    }
    
    const apiUrl = `${API_BASE_URL}/products/${productId}`;
    console.log('Deleting product:', productId);
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to delete product', response.status, response.statusText);
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Delete response:', data);
    
    // Show success message
    alert('Product deleted successfully');
    
    // Refresh product list if needed
    // refreshProductList();
    
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product. Please try again later.');
    return false;
  }
};

const handleEdit = async (adId) => {
  navigate(`/post`, {
    state: {
      productId: adId,
      editMode: true
    }
  });
  onClose();
};

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-blur bg-opacity-100 flex justify-end">
      <div 
        ref={sideSheetRef}
        className="bg-white w-full max-w-md h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out"
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-amber-900 border-b border-amber-600 px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-50">My Ads</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-800"
            aria-label="Close side sheet"
          >
            <X className="w-6 h-6 text-amber-50" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {ads && ads.length > 0 ? (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white border border-amber-200 rounded-lg overflow-hidden shadow-md"
                >
                  <div className="flex items-center p-3 border-b border-amber-100">
                    <div className="w-20 h-20 mr-3">
                      <img
                        src={ad.images && ad.images.length > 0 
                          ? getImageUrl(ad.images[0]) 
                          : 'https://via.placeholder.com/300'}
                        alt={ad.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 truncate">{ad.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-full text-xs">
                          {ad.category}
                        </span>
                        <span className="ml-2 text-amber-600 font-bold">${ad.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-1 p-2">
                    <button
                      onClick={() => handleView(ad.id)}
                      className="flex items-center justify-center py-2 px-3 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(ad.id)}
                      className="flex items-center justify-center py-2 px-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      disabled={deleting === ad.id}
                      className={`flex items-center justify-center py-2 px-3 rounded-lg 
                        ${deleting === ad.id 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                      {deleting === ad.id ? (
                        <span className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                          ...
                        </span>
                      ) : (
                        <>
                          <Trash className="w-4 h-4 mr-1" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-amber-600 py-12">
              <p className="text-lg mb-4">You don't have any ads yet</p>
              <button
                onClick={() => {
                  navigate('/add-product');
                  onClose();
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
              >
                Create Your First Ad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdsSideSheet;