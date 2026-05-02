// Admin Setup Service - Create admin user if not exists
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@1234';

// Setup admin user
export const setupAdminUser = async () => {
  try {
    console.log('Setting up admin user...');
    
    // Check if admin already exists in Firestore
    const adminDocRef = doc(db, 'users', 'admin');
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      console.log('Admin user already exists in Firestore');
      return { ok: true, message: 'Admin user already exists' };
    }
    
    // Try to sign in first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      const user = userCredential.user;
      console.log('Admin user signed in successfully');
      
      // Update profile
      await updateProfile(user, { displayName: 'Admin' });
      
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'System Administrator',
        createdAt: new Date(),
        isActive: true
      });
      
      console.log('Admin user setup complete');
      return { ok: true, message: 'Admin user setup complete' };
      
    } catch (signInError) {
      console.log('Admin user not found, creating new one...');
      
      // Create admin user
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      const user = userCredential.user;
      console.log('Admin user created successfully');
      
      // Update profile
      await updateProfile(user, { displayName: 'Admin' });
      
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'System Administrator',
        createdAt: new Date(),
        isActive: true
      });
      
      console.log('Admin user setup complete');
      return { ok: true, message: 'Admin user created and setup complete' };
    }
    
  } catch (error) {
    console.error('Admin setup error:', error);
    return { ok: false, error: error.message };
  }
};

// Test admin login
export const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;
    
    console.log('Admin login successful:', user.email);
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    console.log('Admin role:', userData?.role);
    
    return { 
      ok: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        role: userData?.role || 'user',
        name: userData?.name || user.displayName
      } 
    };
    
  } catch (error) {
    console.error('Admin login test error:', error);
    return { ok: false, error: error.message };
  }
};
