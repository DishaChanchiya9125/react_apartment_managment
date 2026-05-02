// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAy_IfrLOFw8_l5H4ThT_YBuJYHPw1MSq0",
  authDomain: "apartment-management-demo.firebaseapp.com",
  projectId: "apartment-management-demo",
  storageBucket: "apartment-management-demo.firebasestorage.app",
  messagingSenderId: "560606428336",
  appId: "1:560606428336:web:1079284aecbf6514258f75",
  measurementId: "G-6KMWX7TM58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
