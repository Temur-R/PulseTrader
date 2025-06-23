import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqnCXlzwJXPGKDXKPzxiVPXqZgQQYqwxw",
  authDomain: "stockpulse-f3c7c.firebaseapp.com",
  projectId: "stockpulse-f3c7c",
  storageBucket: "stockpulse-f3c7c.appspot.com",
  messagingSenderId: "368066262321",
  appId: "1:368066262321:web:c0c0c0c0c0c0c0c0c0c0c0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
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