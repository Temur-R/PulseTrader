import React, { useState, useEffect } from 'react';
import { StockPulseAPI } from './services/api';
import { Dashboard } from './components/Dashboard';
import AuthPages from './components/AuthPages';
import { Homepage } from './components/Homepage';
import { Navigation } from './components/Navigation';

type Page = 'home' | 'auth' | 'dashboard';

export const App: React.FC = () => {
  const [api] = useState(() => new StockPulseAPI());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const token = localStorage.getItem('stockpulse_token');
    if (token) {
      api.setToken(token);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, [api]);

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

  const handleLogout = () => {
    localStorage.removeItem('stockpulse_token');
    api.setToken('');
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return isAuthenticated ? <Dashboard api={api} /> : <AuthPages onAuthSuccess={() => {
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        }} />;
      case 'auth':
        return <AuthPages onAuthSuccess={() => {
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        }} />;
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
      />
      {renderPage()}
    </div>
  );
}; 