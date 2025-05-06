import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, LogOut, User, ChevronDown, Filter, Menu, X, BackpackIcon } from "lucide-react";
import AuthModal from '../components/auth-modal';
import Modal from "../components/modal";
import { ArrowLeft } from "lucide-react";
import ProductDetailsPage from './ProductDetailsPage';
import API_BASE_URL from "../config";
import bazaar from '../assets/manImg.png'
import AdsSideSheet from '../components/AdSideSheet';

// Fetch products from backend API
const fetchProducts = async () => {
  try {
    console.log('Fetching products from API...', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      console.error('Failed to fetch products', response.statusText);
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    console.log('Fetched products:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};


const ProductRow = ({ title, products, type, onProductClick }) => {
  const scrollRef = useRef(null);
  
  const filteredProducts = products.filter(p => 
    p.type && p.type.toLowerCase() === type.toLowerCase()
  );
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-3xl font-bold text-amber-800 mr-2 md:mr-4 whitespace-nowrap">{title}</h2>
        <div className="w-2/12 md:w-3/12 border-t-2 border-dashed border-amber-300 mr-2 md:mr-4"></div>
        <div className="flex-grow border-t-2 border-amber-600"></div>
      </div>
      
      <div className="relative">
        {filteredProducts.length > 3 && (
          <>
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronDown className="w-5 h-5 transform rotate-90 text-amber-700" />
            </button>
            
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-10 hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronDown className="w-5 h-5 transform -rotate-90 text-amber-700" />
            </button>
          </>
        )}
        
        <div 
          ref={scrollRef}
          className="overflow-x-auto pb-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-3 md:space-x-6 min-w-max">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div className="min-w-[160px] md:min-w-[240px] lg:min-w-[280px] max-w-[280px]" key={product.id}>
                  <ProductCard 
                    product={product} 
                    onProductClick={() => onProductClick(product.id)}
                  />
                </div>
              ))
            ) : (
              <div className="py-8 px-4 text-amber-500">No products found in this category</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onLikeClick, onProductClick }) => {
  // Helper function to handle image path
  const getImageUrl = (imagePath) => {
    // Check if image path exists
    if (!imagePath) return 'https://via.placeholder.com/300';
    
    // If it's already a complete URL (starts with http)
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's a relative URL (from the API)
    return `${API_BASE_URL}${imagePath}`;
  };

  return (
    <div 
      onClick={() => onProductClick(product.id)}
      className="bg-white group hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden relative cursor-pointer h-full border border-amber-200"
    >
      <div className="relative">
        <img
          src={product.images && product.images.length > 0 
              ? getImageUrl(product.images[0]) 
              : 'https://via.placeholder.com/300'}
          alt={product.title}
          className="w-full h-40 md:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            console.error("Image failed to load:", product.images && product.images[0]);
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
      </div>
      <div className="p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h3 className="text-sm md:text-lg font-semibold text-amber-900 truncate mb-1 md:mb-0">{product.title}</h3>
          <span 
            className="px-2 py-0.5 md:px-3 md:py-1 bg-amber-600 text-white rounded-full text-xs md:text-sm hover:bg-amber-700 transition-colors inline-block w-fit mt-1 md:mt-0"
          >
            {product.category}
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-amber-600 font-bold">${product.price}</span>
        </div>
      </div>
    </div>
  );
};

// Filter component
const FilterPanel = ({ filters, setFilters, applyFilters, isOpen, onClose }) => {
  const [tempFilters, setTempFilters] = useState(filters);
  const filterRef = useRef(null);
  
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters({ ...tempFilters, [name]: value });
  };
  
  const handleSubmit = () => {
    setFilters(tempFilters);
    applyFilters();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div 
        ref={filterRef}
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md border-2 border-amber-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-amber-800">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-amber-100"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-amber-800" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-amber-700 mb-2">Price Range</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-amber-600 mb-1">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={tempFilters.minPrice || ''}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-amber-600 mb-1">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={tempFilters.maxPrice || ''}
                onChange={handleChange}
                className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-3 py-1.5 md:px-4 md:py-2 border border-amber-300 rounded-lg hover:bg-amber-100 text-amber-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  });
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [isAdsSideSheetOpen, setIsAdsSideSheetOpen] = useState(false);
  const [myAds, setMyAds] = useState([]);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    actions: null
  })
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Check for saved user in localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bazaarUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('bazaarUser');
      }
    }
  }, []);

  // Fetch products from the backend when the component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Starting to load products...');
        const fetchedProducts = await fetchProducts();
        if (fetchedProducts && fetchedProducts.length) {
          console.log('Successfully fetched products:', fetchedProducts);
          setAllProducts(fetchedProducts);
          setFilteredProducts(fetchedProducts);
        } else {
          console.log('No products fetched or empty list returned.');
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Apply filters when filter state changes or active tab changes
  useEffect(() => {
    applyFiltersToProducts();
  }, [filters, activeTab, searchTerm, allProducts]);

  // Apply filters to products
  const applyFiltersToProducts = () => {
    let filtered = [...allProducts];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseFloat(filters.maxPrice));
    }
    
    // Apply category filter if active tab is not home
    if (activeTab !== "home") {
      filtered = filtered.filter(product => 
        product.category && product.category.toLowerCase() === activeTab.toLowerCase()
      );
    }
    
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    if (selectedProductId) {
      navigate('/post', {
        state: { productId: selectedProductId }
      });
    }
  }, [selectedProductId, navigate]);
  
  // Handle user data from AuthModal
  const handleAuthMessage = (userData) => {
    console.log("User authenticated:", userData);
    setCurrentUser(userData);
  }
  
  // Handle logout
  const showMessage = (title, description, actions = null) => {
    setMessageModal({
      isOpen: true,
      title,
      description,
      actions
    })
  }

  // Close message modal function
  const closeMessageModal = () => {
    setMessageModal({
      ...messageModal,
      isOpen: false
    })
  }

  const openLogout = () => {
    showMessage(
      "Logging out", 
      "Are you sure you want to Log Out?",
      <button
        onClick={() => {
          closeMessageModal()
          handleLogout()
        }}
        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all font-medium"
      >
        Log Out
      </button>
    )
  }  

  const handleLogout = () => {
    localStorage.removeItem('bazaarUser');
    setCurrentUser(null);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }
  
  const handleAds = async () => {
    try {
      // Get user data from localStorage
      const userDataString = localStorage.getItem('bazaarUser');
      if (!userDataString) {
        console.error('No user data found in localStorage');
        showMessage(
          "Error",
          "Please log in to view Ads"
        )
        return;
      }
      
      const userData = JSON.parse(userDataString);
      const userId = userData.user_id || userData.id;
      if (!userId) {
        console.error('User ID not found in stored data');
        showMessage(
          "Error",
          "USer ID not present Please log in"
        )
        return;
      }
      
      // Check if API_BASE_URL is properly configured
      if (!API_BASE_URL || API_BASE_URL === 'undefined' || API_BASE_URL === '') {
        console.error('API_BASE_URL is not properly configured:', API_BASE_URL);
        showMessage(
          "Server Maintainance",
          "Please try again later"
        )
        return;
      }
      
      console.log('Fetching ads for user ID:', userId);
      // Ensure the URL is valid before making the request
      const apiUrl = `${API_BASE_URL}/ads`;
      console.log('Request URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ id: userId })
      });
      
      if (!response.ok) {
        console.error('Failed to fetch ads', response.status, response.statusText);
        throw new Error(`Failed to fetch ads: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched ads:', data);
      
      if (data.adslist && data.adslist.length > 0) {
        // Process image URLs to ensure they're fully qualified
        const processedAds = data.adslist.map(ad => {
          // Check if images exist and is an array
          if (ad.images && Array.isArray(ad.images)) {
            // Process each image URL to ensure it has the base URL if it's a relative path
            const processedImages = ad.images.map(imagePath => {
              // If the path is already absolute (starts with http or https), return as is
              if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
              }
              
              // Otherwise, append the API_BASE_URL to make it a full URL
              // Remove any leading slash from the image path to avoid double slashes
              const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
              return `${API_BASE_URL}/${cleanPath}`;
            });
            
            return { ...ad, images: processedImages };
          }
          return ad;
        });
        
        setMyAds(processedAds);
        setIsAdsSideSheetOpen(true);
        setIsDropdownOpen(false); // Close the dropdown when opening side sheet
      } else {
        showMessage(
          "No Ads",
          "You haven't created any ads yet, Click the button below to create your first ad",
          <button
          onClick={() => {
              closeMessageModal()
              navigate('/add-product')
            }}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all font-medium"
          >
            Make ads?
          </button>
        )
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching ads:', error);
      showMessage(
        "Server Error", 
        "Failed to fetch ads.",
      )
      return [];
    }
  };


  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Apply filters
  const applyFilters = () => {
    applyFiltersToProducts();
  };
  
  return (
    <div className="h-screen w-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-amber-900 border-b border-amber-600 shadow-md">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center">
          <img 
            src={bazaar} 
            alt="Bazaar" 
            style={{ width: '200px', height: '60px', objectFit: 'cover' }} 
          />
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden ml-2 p-1 text-amber-50 hover:text-white"
          >
            {isMobileMenuOpen ? 
              <X className="h-6 w-6" /> : 
              <Menu className="h-6 w-6" />
            }
          </button>

          {/* Desktop search and controls */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-amber-700 rounded-lg bg-amber-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-200"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-amber-200" />
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="px-4 py-2 mr-3 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
              >
                Login / Sign Up
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{currentUser.username}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-amber-200">
                      <button
                        onClick={handleAds}
                        className="flex items-center w-full px-4 py-2 text-amber-800 hover:bg-amber-100 transition-colors"
                      >
                        <span>Your ads</span>
                      </button>
                      <button
                        onClick={openLogout}
                        className="flex items-center w-full px-4 py-2 text-amber-800 hover:bg-amber-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-amber-600" />
                        <span>Logout</span>
                      </button>
                      
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigate("/add-product")}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full shadow-lg hover:from-amber-600 hover:to-amber-500 transition-colors"
                >
                  <span className="text-2xl font-bold">+</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile search bar */}
        <div className="md:hidden px-4 pb-3 pt-1 bg-amber-900">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-1.5 pl-8 pr-3 text-sm border border-amber-700 rounded-lg bg-amber-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-200"
            />
            <Search className="absolute left-2 top-2 h-4 w-4 text-amber-200" />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-30 md:hidden bg-amber-900 bg-opacity-95 flex flex-col pt-16 pb-6 px-4"
        >
          <div className="space-y-4">
            {/* <button
              onClick={() => {
                setIsFilterOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Filter className="w-4 h-4 mr-3" />
              <span>Filters</span>
            </button> */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              className="w-10 h-10 flex items-center justify-center bg-amber-600 text-white rounded-full hover:bg-amber-500 transition-colors"
              aria-label="Close menu"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {!currentUser ? (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
              >
                Login / Sign Up
              </button>
            ) : (
              <>
                <div className="flex items-center px-4 py-3 bg-amber-800 rounded-lg">
                  <User className="h-5 w-5 text-amber-200 mr-3" />
                  <span className="font-medium text-white">{currentUser.username}</span>
                </div>

                <button
                  onClick={openLogout}
                  className="flex items-center w-full px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span>Logout</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate("/add-product");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-lg hover:from-amber-600 hover:to-amber-500 transition-colors"
                >
                  <span className="text-xl font-bold mr-2">+</span>
                  <span>Add New Product</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="bg-amber-900 p-1 md:p-2 rounded-full">
            <div className="grid grid-cols-3 gap-4 md:gap-2">
              <button
                onClick={() => setActiveTab("home")}
                className={`text-white text-sm md:text-base px-3 py-1 rounded-full transition-colors duration-300 ease-in-out ${
                  activeTab === "home" ? "bg-amber-600" : "bg-amber-800"
                } md:px-12`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("buy")}
                className={`text-white text-sm md:text-base px-3 py-1 rounded-full transition-colors duration-300 ease-in-out ${
                  activeTab === "buy" ? "bg-amber-600" : "bg-amber-800"
                } md:px-12`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab("rent")}
                className={`text-white text-sm md:text-base px-3 py-1 rounded-full transition-colors duration-300 ease-in-out ${
                  activeTab === "rent" ? "bg-amber-600" : "bg-amber-800"
                } md:px-12`}
              >
                Rent
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 md:py-20">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <>
            {/* Product rows for Home, Buy, and Rent tabs */}
            {activeTab === "home" || activeTab === "buy" || activeTab === "rent" ? (
              <>
                <ProductRow 
                  title="Casual Collection" 
                  products={filteredProducts} 
                  type="casual" 
                  onProductClick={setSelectedProductId}
                />
                
                <ProductRow 
                  title="Bridal Collection" 
                  products={filteredProducts} 
                  type="bridal" 
                  onProductClick={setSelectedProductId}
                />
                
                <ProductRow 
                  title="Formal Collection" 
                  products={filteredProducts} 
                  type="formal" 
                  onProductClick={setSelectedProductId}
                />
              </>
            ) : null}
            
            {filteredProducts.length === 0 && !loading && (
              <div className="flex justify-center items-center py-8 md:py-10">
                <div className="text-amber-500 text-base md:text-lg">No products found</div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Fixed add button for mobile */}
      {currentUser && (
        <div className="fixed bottom-6 right-6 md:hidden z-20">
          <button
            onClick={() => navigate("/add-product")}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full shadow-lg hover:from-amber-600 hover:to-amber-500 transition-colors"
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>
      )}
        <AdsSideSheet 
        isOpen={isAdsSideSheetOpen} 
        onClose={() => setIsAdsSideSheetOpen(false)} 
        ads={myAds} 
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        emitMessage={handleAuthMessage}
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      {messageModal.isOpen && (
        <Modal
          title={messageModal.title}
          description={messageModal.description}
          actions={messageModal.actions}
          onClose={closeMessageModal}
        />
      )}
      {/* Add custom styles for hiding scrollbars */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
    
  );

 
}