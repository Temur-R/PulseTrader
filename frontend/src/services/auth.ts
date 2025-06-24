import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const registerWithEmail = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    // Provide more descriptive error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already in use. Please use a different email or log in.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('The email address is not valid.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else {
      throw new Error(error.message || 'Registration failed.');
    }
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = (): Promise<AuthUser | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
};