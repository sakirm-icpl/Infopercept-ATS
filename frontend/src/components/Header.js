import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import InfoperceptLogo from './InfoperceptLogo';

const Header = ({ variant = 'dark' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Contact', href: '#contact' }
  ];

  const isDark = variant === 'dark';

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`${isDark ? 'bg-white/10 backdrop-blur-md border-b border-white/20' : 'bg-white shadow-sm border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <InfoperceptLogo 
                size="md" 
                variant="default" 
                showText={true} 
                textColor={isDark ? "text-white" : "text-gray-900"} 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href.replace('#', ''))}
                className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors font-medium`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isDark 
                  ? 'text-white/80 hover:text-white border border-white/20 hover:border-white/40' 
                  : 'text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${isDark ? 'bg-white/10 backdrop-blur-md' : 'bg-gray-50'} rounded-lg mt-2`}>
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href.replace('#', ''))}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  className={`block w-full text-center px-3 py-2 rounded-md text-base font-medium ${
                    isDark 
                      ? 'text-white border border-white/20 hover:bg-white/10' 
                      : 'text-gray-700 border border-gray-300 hover:bg-gray-100'
                  } transition-colors`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md text-base font-medium transition-all duration-200"
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