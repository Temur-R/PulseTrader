import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxEpZwxqKcXr2kG_KfVJtQQN-qRB7oVhE",
  authDomain: "stockpulse-c6d3f.firebaseapp.com",
  projectId: "stockpulse-c6d3f",
  storageBucket: "stockpulse-c6d3f.appspot.com",
  messagingSenderId: "368066262321",
  appId: "1:368066262321:web:b8e5e5e5e5e5e5e5e5e5e5",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  client_id: '368066262321-1a69e8ac6chvn89693msd4gs3ubaptft.apps.googleusercontent.com'
});

export { googleProvider };
export default app; 