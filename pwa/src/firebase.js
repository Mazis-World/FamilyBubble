// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOQK3z7XNdJ2P2JW10hbSBv0GLiO2oJkE",
  authDomain: "familybubble-ecfa6.firebaseapp.com",
  projectId: "familybubble-ecfa6",
  storageBucket: "familybubble-ecfa6.firebasestorage.app",
  messagingSenderId: "804761460768",
  appId: "1:804761460768:web:1010dccfd9d48b1e695c45",
  measurementId: "G-ZP7G17MS89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
