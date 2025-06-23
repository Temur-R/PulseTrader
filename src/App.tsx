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
  console.log('AppContent rendering...');
  const { user, loading, error: firebaseError, signOutUser } = useFirebase();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AppContent useEffect - User state changed:', { user, loading, firebaseError });
    // Initialize API with token from localStorage
    const storedToken = localStorage.getItem('stockpulse_token');
    if (storedToken) {
      console.log('Found stored token, initializing API...');
      api.setToken(storedToken);
    }
    
    if (user && (currentPage === 'home' || currentPage === 'signin' || currentPage === 'signup')) {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (firebaseError) {
      console.error('Firebase error detected:', firebaseError);
      setError(firebaseError);
    }
  }, [firebaseError]);

  const handleSignIn = () => {
    console.log('Handling sign in...');
    setCurrentPage('signin');
  };

  const handleGetStarted = () => {
    console.log('Handling get started...');
    setCurrentPage('signup');
  };

  const handleHome = () => {
    console.log('Handling home...');
    if (!user) {
      setCurrentPage('home');
    }
  };

  const handleDashboard = () => {
    console.log('Handling dashboard...');
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('signin');
    }
  };

  const handlePricing = () => {
    console.log('Handling pricing...');
    setCurrentPage('pricing');
  };

  const handleAuthSuccess = (token: string) => {
    console.log('Auth success, setting token...');
    api.setToken(token);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    console.log('Handling logout...');
    try {
      // Sign out from Firebase
      await signOutUser();
      
      // Clear API token
      api.clearToken();
      
      // Navigate to signin page instead of home
      setCurrentPage('signin');
      
      console.log('Logout successful');
    } catch (err: any) {
      console.error('Error during logout:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white bg-red-600/20 p-4 rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-white text-red-600 rounded hover:bg-red-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  console.log('Rendering page:', currentPage);
  const renderPage = () => {
    try {
      // If user is logged in, only allow dashboard and pricing pages
      if (user) {
        switch (currentPage) {
          case 'dashboard':
            return <Dashboard api={api} />;
          case 'pricing':
            return <PricingPage onGetStarted={handleGetStarted} />;
          // For any other page, redirect to dashboard when logged in
          default:
            return <Dashboard api={api} />;
        }
      }

      // If not logged in, allow all pages
      switch (currentPage) {
        case 'dashboard':
          return <AuthPages onAuthSuccess={handleAuthSuccess} initialMode="signin" />;
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
    } catch (err: any) {
      console.error('Error rendering page:', err);
      return (
        <div className="text-white bg-red-600/20 p-4 rounded-lg">
          Error rendering page: {err.message}
        </div>
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
        onLogout={handleLogout}
        onPricing={handlePricing}
      />
      <div className="pt-20">
        {renderPage()}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  console.log('Main App component rendering...');
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}; 