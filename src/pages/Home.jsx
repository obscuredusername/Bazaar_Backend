import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, LogOut, User, ChevronDown, Filter } from "lucide-react";
import AuthModal from '../components/auth-modal';
import ProductDetailsPage from './ProductDetailsPage';
import API_BASE_URL from "../config";

// Fetch products from backend API
const fetchProducts = async () => {
  try {
    console.log('Fetching products from API...');
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      mode: 'cors', // <-- this is important
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
  // Filter products by category (case insensitive)
  const filteredProducts = products.filter(p => 
    p.type && p.type.toLowerCase() === type.toLowerCase()
  );
  
  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mr-4">{title}</h2>
        <div className="w-3/12 border-t-2 border-dashed border-teal-300 mr-4"></div>
        <div className="flex-grow border-t-2 border-teal-600"></div>
      </div>
      
      <div className="relative overflow-x-auto pb-4">
        <div className="flex space-x-6 min-w-max">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div className="min-w-[280px] max-w-[280px]" key={product.id}>
                <ProductCard 
                  product={product} 
                  onLikeClick={() => alert(`Liked ${product.id}`)}
                  onProductClick={() => onProductClick(product.id)}
                />
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-gray-500">No products found in this category</div>
          )}
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
      className="bg-white group hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden relative cursor-pointer h-full"
    >
      <div className="relative">
        <img
          src={product.images && product.images.length > 0 
              ? getImageUrl(product.images[0]) 
              : 'https://via.placeholder.com/300'}
          alt={product.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            console.error("Image failed to load:", product.images && product.images[0]);
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLikeClick();
          }}
          className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
        >
          <Heart className="w-5 h-5 text-gray-700 hover:fill-red-500 hover:text-red-500" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.title}</h3>
          <span 
            className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm hover:bg-teal-700 transition-colors"
          >
            {product.category}
          </span>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-teal-600 font-bold">${product.price}</span>
        </div>
      </div>
    </div>
  );
};
// Filter component
const FilterPanel = ({ filters, setFilters, applyFilters, isOpen, onClose }) => {
  const [tempFilters, setTempFilters] = useState(filters);
  
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);
  
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price Range</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={tempFilters.minPrice || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={tempFilters.maxPrice || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                min="0"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
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
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  });
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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

  if (selectedProductId) {
    return <ProductDetailsPage 
      productId={selectedProductId}
      onBack={() => setSelectedProductId(null)} 
    />;
  }
  
  // Handle user data from AuthModal
  const handleAuthMessage = (userData) => {
    console.log("User authenticated:", userData);
    setCurrentUser(userData);
  }
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('bazaarUser');
    setCurrentUser(null);
    setIsDropdownOpen(false);
    alert('You have been logged out');
  }
  
  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Apply filters
  const applyFilters = () => {
    applyFiltersToProducts();
  };
  
  return (
    <div className="h-screen w-640 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-teal-600">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">Bazaar</h1>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="px-4 py-2 mr-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            {!currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Login / Sign Up
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">{currentUser.username}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-teal-600" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigate("/add-product")}
                  className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-400 text-white rounded-full shadow-lg hover:from-teal-600 hover:to-emerald-500 transition-colors"
                >
                  <span className="text-2xl font-bold">+</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <div className="bg-gray-800 p-2 rounded-full">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab("home")}
                className={`text-white px-12 py-1 rounded-full transition-colors duration-300 ease-in-out ${
                  activeTab === "home" ? "bg-teal-600" : "bg-gray-800"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("buy")}
                className={`text-white px-12 py-1 rounded-full transition-colors duration-300 ease-in-out ${
                  activeTab === "buy" ? "bg-teal-600" : "bg-gray-800"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab("rent")}
                className={`text-white px-12 py-1 rounded-full transition-colors duration-300 ease-in-out ${
                  activeTab === "rent" ? "bg-teal-600" : "bg-gray-800"
                }`}
              >
                Rent
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
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
              <div className="flex justify-center items-center py-10">
                <div className="text-gray-500 text-lg">No products found</div>
              </div>
            )}
          </>
        )}
      </main>
      
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
    </div>
  );
}
