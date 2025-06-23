import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import AuthPages from './components/AuthPages';
import { Navigation } from './components/Navigation';
import PricingPage from './components/Pricing';
import { Homepage } from './components/Homepage';
import { PulseTraderAPI } from './services/api';

type Page = 'home' | 'dashboard' | 'login' | 'register' | 'pricing';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const api = new PulseTraderAPI();

  const handleSignIn = () => setCurrentPage('login');
  const handleGetStarted = () => setCurrentPage('register');
  const handlePricing = () => setCurrentPage('pricing');
  const handleHome = () => setCurrentPage('home');
  const handleDashboard = () => setCurrentPage('dashboard');
  const handleAuthSuccess = (token: string) => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };
  const handleLogout = async () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
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

      {currentPage === 'home' && (
        <Homepage
          onSignIn={handleSignIn}
          onGetStarted={handleGetStarted}
        />
      )}

      {currentPage === 'dashboard' && isAuthenticated && (
        <Dashboard api={api} />
      )}

      {(currentPage === 'login' || currentPage === 'register') && (
        <AuthPages
          onAuthSuccess={handleAuthSuccess}
          initialMode={currentPage === 'login' ? 'signin' : 'signup'}
        />
      )}

      {currentPage === 'pricing' && (
        <PricingPage
          onGetStarted={handleGetStarted}
        />
      )}
    </div>
  );
};

export default App;