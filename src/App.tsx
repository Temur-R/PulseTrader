import React, { useState, useEffect } from 'react';
import { StockPulseAPI } from './services/api';
import { Dashboard } from './components/Dashboard';
import AuthPages from './components/AuthPages';
import { Homepage } from './components/Homepage';
import { Navigation } from './components/Navigation';
import PricingPage from './components/Pricing';

type Page = 'home' | 'auth' | 'dashboard' | 'pricing';

// Create a single API instance outside the component to ensure it's not recreated
const api = new StockPulseAPI();

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('stockpulse_token');
      if (token) {
        try {
          api.setToken(token);
          // Verify the token is valid by making a test request
          await api.getUserProfile();
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('stockpulse_token');
          api.setToken('');
          setIsAuthenticated(false);
          setCurrentPage('home');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleSignIn = () => {
    setCurrentPage('auth');
  };

  const handleGetStarted = () => {
    setCurrentPage('auth');
  };

  const handleHome = () => {
    setCurrentPage('home');
  };

  const handleDashboard = () => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('auth');
    }
  };

  const handlePricing = () => {
    setCurrentPage('pricing');
  };

  const handleLogout = () => {
    localStorage.removeItem('stockpulse_token');
    api.setToken('');
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleAuthSuccess = (token: string) => {
    api.setToken(token);
    localStorage.setItem('stockpulse_token', token);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return isAuthenticated ? <Dashboard api={api} /> : <AuthPages onAuthSuccess={handleAuthSuccess} />;
      case 'auth':
        return <AuthPages onAuthSuccess={handleAuthSuccess} />;
      case 'pricing':
        return <PricingPage />;
      case 'home':
      default:
        return (
          <Homepage
            onSignIn={handleSignIn}
            onGetStarted={handleGetStarted}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
        onHome={handleHome}
        onDashboard={handleDashboard}
        onLogout={handleLogout}
        onPricing={handlePricing}
      />
      {renderPage()}
    </div>
  );
}; 