import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { PulseTraderAPI } from '../services/api';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<{ user: User }>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User }>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: User }>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);
const api = new PulseTraderAPI();

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  console.log('FirebaseProvider initializing...');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthStateChange = useCallback(async (user: User | null) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user');
    
    if (user) {
      try {
        const firebaseToken = await user.getIdToken();
        await api.exchangeFirebaseToken(firebaseToken);
      } catch (error) {
        console.error('Failed to exchange Firebase token:', error);
        setError('Failed to authenticate with the server');
      }
    } else {
      api.clearToken();
    }
    
    setUser(user);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    console.log('Setting up Firebase auth state listener');
    
    try {
      // Check if Firebase is properly initialized
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      const unsubscribe = onAuthStateChanged(
        auth,
        handleAuthStateChange,
        (error) => {
          console.error('Auth state change error:', error);
          setError(`Authentication error: ${error.message}`);
          setLoading(false);
        }
      );

      return () => {
        console.log('Cleaning up Firebase auth state listener');
        unsubscribe();
      };
    } catch (error: any) {
      console.error('Firebase initialization error:', error);
      setError(`Firebase initialization failed: ${error.message}`);
      setLoading(false);
    }
  }, [handleAuthStateChange]);

  const signInWithGoogle = async (): Promise<{ user: User }> => {
    console.log('Attempting Google sign in');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful');
      return { user: result.user };
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by the browser. Please allow pop-ups and try again.');
      }
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ user: User }> => {
    console.log('Attempting email sign in');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email sign in successful');
      return { user: result.user };
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      }
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string): Promise<{ user: User }> => {
    console.log('Attempting email sign up');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Email sign up successful');
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });
      return { user: result.user };
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters');
      }
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signOutUser = async () => {
    console.log('Attempting sign out');
    try {
      await signOut(auth);
      api.clearToken();
      console.log('Sign out successful');
      setError(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
  };

  console.log('FirebaseProvider current state:', { user: !!user, loading, error });
  
  if (error) {
    console.error('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white bg-red-600/20 p-4 rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-2">Firebase Error</h2>
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
    console.log('Rendering loading state');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4 mx-auto"></div>
          <div>Initializing Firebase...</div>
        </div>
      </div>
    );
  }

  console.log('Rendering normal state, user:', user ? 'logged in' : 'not logged in');
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 