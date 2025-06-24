import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

import { auth, db, googleProvider } from '../services/firebase';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCKFwGb99DhNy-1dNPEq-PdOkdbau4XluU",
  authDomain: "pulsetrader-3505c.firebaseapp.com",
  projectId: "pulsetrader-3505c",
  storageBucket: "pulsetrader-3505c.firebasestorage.app",
  messagingSenderId: "684793998943",
  appId: "1:684793998943:web:7892e3d72c94b624e935ea",
  measurementId: "G-ZZLWHGSSFP"
};

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<string>;
  signInWithEmail: (email: string, password: string) => Promise<string>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<string>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<string> => {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return token;
  };

  const signInWithEmail = async (email: string, password: string): Promise<string> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    return token;
  };

  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string): Promise<string> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's profile with their name
    await updateProfile(result.user, {
      displayName: `${firstName} ${lastName}`
    });
    const token = await result.user.getIdToken();
    return token;
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};