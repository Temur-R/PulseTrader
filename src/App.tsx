import React, { useState, useEffect } from 'react';
import { PulseTraderAPI } from './services/api';
import { Dashboard } from './components/Dashboard';
import AuthPages from './components/AuthPages';
import { Homepage } from './components/Homepage';
import { Navigation } from './components/Navigation';
import PricingPage from './components/Pricing';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';

type Page = 'home' | 'signin' | 'signup' | 'dashboard' | 'pricing';

// Create a single API instance outside the component to ensure it's not recreated
const api = new PulseTraderAPI();

const AppContent: React.FC = () => {
  const { user, loading, signOutUser } = useFirebase();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    if (user) {
      setCurrentPage('dashboard');
    }
  }, [user]);

  const handleSignIn = () => {
    setCurrentPage('signin');
  };

  const handleGetStarted = () => {
    setCurrentPage('signup');
  };

  const handleHome = () => {
    setCurrentPage('home');
  };

  const handleDashboard = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('signin');
    }
  };

  const handlePricing = () => {
    setCurrentPage('pricing');
  };

  const handleAuthSuccess = (token: string) => {
    api.setToken(token);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return user ? <Dashboard api={api} /> : <AuthPages onAuthSuccess={handleAuthSuccess} initialMode="signin" />;
      case 'signin':
      case 'signup':
        return <AuthPages onAuthSuccess={handleAuthSuccess} initialMode={currentPage === 'signin' ? 'signin' : 'signup'} />;
      case 'pricing':
        return <PricingPage onGetStarted={handleGetStarted} />;
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
        isAuthenticated={!!user}
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
        onHome={handleHome}
        onDashboard={handleDashboard}
        onLogout={async () => {
          await signOutUser();
          localStorage.removeItem('pulsetrader_token');
          api.setToken('');
          setCurrentPage('home');
        }}
        onPricing={handlePricing}
      />
      {renderPage()}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
};