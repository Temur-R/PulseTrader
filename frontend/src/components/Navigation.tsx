import React, { useState, useEffect } from 'react';
import { TrendingUp, Menu, X } from 'lucide-react';

interface NavigationProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onGetStarted: () => void;
  onHome: () => void;
  onDashboard: () => void;
  onLogout: () => void;
  onPricing: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  onSignIn,
  onGetStarted,
  onHome,
  onDashboard,
  onLogout,
  onPricing
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileAction = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await onLogout();
    setShowSignOutPopup(true);
    setTimeout(() => setShowSignOutPopup(false), 2000);
  };

  return (
    <>
      {/* Sign Out Popup */}
      {showSignOutPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all">
          Successfully signed out
        </div>
      )}
      <nav className="bg-slate-900 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={onHome}>
                <TrendingUp className="h-8 w-8 text-cyan-400" />
                <span className="ml-2 text-xl font-bold text-white">PulseTrader</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={onHome}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </button>
                <button
                  onClick={onDashboard}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={onPricing}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </button>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-cyan-500/20 text-sm font-medium rounded-lg text-white bg-transparent hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={onSignIn}
                    className="px-4 py-2 border border-cyan-500/20 text-sm font-medium rounded-lg text-white bg-transparent hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity sm:hidden" />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`mobile-menu fixed top-0 right-0 h-full w-64 bg-slate-900 border-l border-cyan-500/20 transform transition-transform duration-300 ease-in-out z-50 sm:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-cyan-400" />
            <span className="ml-2 text-lg font-bold text-white">PulseTrader</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-2 py-4">
          <div className="space-y-1">
            <button
              onClick={() => handleMobileAction(onHome)}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-md text-base font-medium flex items-center"
            >
              Home
            </button>
            <button
              onClick={() => handleMobileAction(onDashboard)}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-md text-base font-medium flex items-center"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleMobileAction(onPricing)}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-md text-base font-medium flex items-center"
            >
              Pricing
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            {isAuthenticated ? (
              <button
                onClick={() => handleMobileAction(onLogout)}
                className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-md text-base font-medium flex items-center"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleMobileAction(onSignIn)}
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-md text-base font-medium flex items-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleMobileAction(onGetStarted)}
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-md text-base font-medium flex items-center"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};