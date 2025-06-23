import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Menu, X, LogOut, Settings, User } from 'lucide-react';

interface NavigationProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onGetStarted: () => void;
  onHome: () => void;
  onDashboard?: () => void;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  onSignIn,
  onGetStarted,
  onHome,
  onDashboard,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onHome}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StockPulse</span>
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
            {isAuthenticated ? (
              <>
                <button
                  onClick={onDashboard}
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  Dashboard
                </button>
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {/* Settings Dropdown */}
                  {isSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-cyan-400"
                          role="menuitem"
                          onClick={() => {
                            setIsSettingsOpen(false);
                            // Add profile handler here when implemented
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-red-400"
                          role="menuitem"
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onLogout?.();
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={onSignIn} className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-cyan-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-cyan-400">Pricing</a>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={onDashboard}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-cyan-400"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Add profile handler here when implemented
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-cyan-400"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout?.();
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSignIn}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onGetStarted}
                    className="block w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};