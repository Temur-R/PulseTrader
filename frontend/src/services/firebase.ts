import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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