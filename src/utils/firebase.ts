import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  // These would typically come from environment variables
  apiKey: "demo-api-key",
  authDomain: "study-abroad-app.firebaseapp.com",
  projectId: "study-abroad-app",
  storageBucket: "study-abroad-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();