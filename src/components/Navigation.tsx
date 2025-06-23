import React, { useState } from 'react';
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-slate-900 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer" 
                onClick={isAuthenticated ? onDashboard : onHome}
              >
                <TrendingUp className="h-8 w-8 text-cyan-400" />
                <span className="ml-2 text-xl font-bold text-white">PulseTrader</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {!isAuthenticated && (
                  <button
                    onClick={onHome}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Home
                  </button>
                )}
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
            
            {/* Desktop auth buttons */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={onLogout}
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
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-slate-900 border-b border-cyan-500/20 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!isAuthenticated && (
              <button
                onClick={() => {
                  onHome();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </button>
            )}
            <button
              onClick={() => {
                onDashboard();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                onPricing();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium"
            >
              Pricing
            </button>
            
            {/* Mobile auth buttons */}
            <div className="pt-2 border-t border-cyan-500/20">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onSignIn();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};