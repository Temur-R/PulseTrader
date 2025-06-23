import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKFwGb99DhNy-1dNPEq-PdOkdbau4XluU",
  authDomain: "pulsetrader-3505c.firebaseapp.com",
  projectId: "pulsetrader-3505c",
  storageBucket: "pulsetrader-3505c.firebasestorage.app",
  messagingSenderId: "684793998943",
  appId: "1:684793998943:web:7892e3d72c94b624e935ea",
  measurementId: "G-ZZLWHGSSFP"
};

console.log('Initializing Firebase...');

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
console.log('✓ Firebase initialized successfully');

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
console.log('✓ Firebase services initialized');

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
console.log('✓ Google Auth Provider configured');

// Export initialized instances
export { auth, db, googleProvider, app };
export default app; 