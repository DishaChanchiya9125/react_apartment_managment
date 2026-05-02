// Firebase Authentication Service
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@1234';

// Login function
export const login = async (email, password) => {
  try {
    console.log('Attempting login for:', email);
    
    // Check if it's admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('Admin login detected');
      
      // Try to sign in with Firebase Auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Admin signed in successfully:', user.uid);
        
        // Update user profile with admin role
        await updateProfile(user, { displayName: 'Admin' });
        
        // Save admin role in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          role: 'admin',
          name: 'System Administrator',
          createdAt: new Date(),
          isActive: true
        }, { merge: true });
        
        console.log('Admin role saved to Firestore');
        return { ok: true, user: { uid: user.uid, email: email, role: 'admin' } };
        
      } catch (error) {
        console.log('Admin sign in failed:', error.code);
        
        // If admin user doesn't exist in Firebase Auth, create it
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          console.log('Creating admin user...');
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          console.log('Admin user created:', user.uid);
          
          await updateProfile(user, { displayName: 'Admin' });
          
          await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: 'admin',
            name: 'System Administrator',
            createdAt: new Date(),
            isActive: true
          });
          
          console.log('Admin user setup complete');
          return { ok: true, user: { uid: user.uid, email: email, role: 'admin' } };
        }
        throw error;
      }
    }
    
    // Regular user login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
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
    console.error('Login error:', error);
    return { ok: false, error: getErrorMessage(error) };
  }
};

// Register function
export const register = async (email, password, name = '') => {
  try {
    if (email === ADMIN_EMAIL) {
      return { ok: false, error: 'This email is reserved for admin' };
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile
    if (name) {
      await updateProfile(user, { displayName: name });
    }
    
    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      role: 'user',
      name: name || '',
      createdAt: new Date(),
      isActive: true
    });
    
    return { ok: true, user: { uid: user.uid, email: email, role: 'user', name: name } };
  } catch (error) {
    console.error('Registration error:', error);
    return { ok: false, error: getErrorMessage(error) };
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { ok: false, error: getErrorMessage(error) };
  }
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        callback({
          uid: user.uid,
          email: user.email,
          role: userData?.role || 'user',
          name: userData?.name || user.displayName,
          loading: false
        });
      } catch (error) {
        callback({
          uid: user.uid,
          email: user.email,
          role: 'user',
          name: user.displayName,
          loading: false
        });
      }
    } else {
      callback(null);
    }
  });
};

// Error message helper
const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'User not found. Please register first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'Email already registered. Please login.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};
