import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="header py-4 px-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/public/assets/images/neufin tagline bare logo.png" 
              alt="Neufin Logo" 
              className="h-10"
            />
            <span className="ml-2 text-2xl font-bold text-blue-700">Neufin</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center nav-link">
                Products <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute z-10 left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white rounded-md shadow-lg py-2">
                <Link to="/sentiment-analysis" className="block px-4 py-2 hover:bg-blue-50">
                  Neufin Sentient
                </Link>
                <Link to="/stock-analysis" className="block px-4 py-2 hover:bg-blue-50">
                  Neufin Nemo
                </Link>
                <Link to="/investment-recommendations" className="block px-4 py-2 hover:bg-blue-50">
                  Neufin O2
                </Link>
                <Link to="/behavioral-bias-analyzer" className="block px-4 py-2 hover:bg-blue-50">
                  Neufin BBA
                </Link>
              </div>
            </div>
            <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}>
              Pricing
            </Link>
            <Link to="/market-data" className={`nav-link ${isActive('/market-data') ? 'active' : ''}`}>
              Market Data
            </Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </nav>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none" 
            onClick={toggleMenu}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <div className="border-b border-gray-200 py-2">
                <div className="font-medium mb-2">Products</div>
                <div className="pl-4 flex flex-col space-y-2">
                  <Link 
                    to="/sentiment-analysis" 
                    className="nav-link"
                    onClick={toggleMenu}
                  >
                    Neufin Sentient
                  </Link>
                  <Link 
                    to="/stock-analysis" 
                    className="nav-link"
                    onClick={toggleMenu}
                  >
                    Neufin Nemo
                  </Link>
                  <Link 
                    to="/investment-recommendations" 
                    className="nav-link"
                    onClick={toggleMenu}
                  >
                    Neufin O2
                  </Link>
                  <Link 
                    to="/behavioral-bias-analyzer" 
                    className="nav-link"
                    onClick={toggleMenu}
                  >
                    Neufin BBA
                  </Link>
                </div>
              </div>
              <Link 
                to="/pricing" 
                className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                Pricing
              </Link>
              <Link 
                to="/market-data" 
                className={`nav-link ${isActive('/market-data') ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                Market Data
              </Link>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Link 
                  to="/login" 
                  className="btn-secondary w-full text-center"
                  onClick={toggleMenu}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary w-full text-center"
                  onClick={toggleMenu}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;