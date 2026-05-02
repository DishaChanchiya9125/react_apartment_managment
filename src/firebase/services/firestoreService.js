// Firestore Database Service
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase-config';

// Generic CRUD operations
export class FirestoreService {
  constructor(collectionName) {
    this.collection = collection(db, collectionName);
  }

  // Create document
  async create(data) {
    try {
      const docRef = await addDoc(this.collection, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { ok: true, id: docRef.id };
    } catch (error) {
      console.error('Create error:', error);
      return { ok: false, error: error.message };
    }
  }

  // Get document by ID
  async getById(id) {
    try {
      const docRef = doc(db, this.collection.path, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { ok: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { ok: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error('Get by ID error:', error);
      return { ok: false, error: error.message };
    }
  }

  // Get all documents with optional filtering
  async getAll(filters = {}, pagination = {}) {
    try {
      console.log(`Getting all documents from collection: ${this.collection.path}`);
      console.log('Filters:', filters);
      console.log('Pagination:', pagination);
      
      let q = this.collection;
      
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          console.log(`Applying filter: ${key} == ${filters[key]}`);
          q = query(q, where(key, '==', filters[key]));
        }
      });
      
      // Apply ordering
      if (pagination.orderBy) {
        console.log(`Applying ordering: ${pagination.orderBy} ${pagination.orderDirection || 'desc'}`);
        q = query(q, orderBy(pagination.orderBy, pagination.orderDirection || 'desc'));
      }
      
      // Apply pagination
      if (pagination.limit) {
        console.log(`Applying limit: ${pagination.limit}`);
        q = query(q, limit(pagination.limit));
      }
      
      if (pagination.startAfter) {
        q = query(q, startAfter(pagination.startAfter));
      }
      
      const querySnapshot = await getDocs(q);
      console.log(`Query returned ${querySnapshot.docs.length} documents`);
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Processed documents:', documents);
      return { ok: true, data: documents };
    } catch (error) {
      console.error('Get all error:', error);
      console.error('Error details:', {
        collection: this.collection.path,
        filters,
        pagination,
        errorMessage: error.message,
        errorCode: error.code
      });
      return { ok: false, error: error.message };
    }
  }

  // Update document
  async update(id, data) {
    try {
      const docRef = doc(db, this.collection.path, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { ok: true };
    } catch (error) {
      console.error('Update error:', error);
      return { ok: false, error: error.message };
    }
  }

  // Delete document
  async delete(id) {
    try {
      const docRef = doc(db, this.collection.path, id);
      await deleteDoc(docRef);
      return { ok: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { ok: false, error: error.message };
    }
  }

  // Query with multiple conditions
  async query(conditions, pagination = {}) {
    try {
      let q = this.collection;
      
      // Apply multiple conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Apply ordering
      if (pagination.orderBy) {
        q = query(q, orderBy(pagination.orderBy, pagination.orderDirection || 'desc'));
      }
      
      // Apply pagination
      if (pagination.limit) {
        q = query(q, limit(pagination.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { ok: true, data: documents };
    } catch (error) {
      console.error('Query error:', error);
      return { ok: false, error: error.message };
    }
  }
}

// Specific services for each collection
export const userService = new FirestoreService('users');
export const apartmentService = new FirestoreService('apartments');
export const maintenanceService = new FirestoreService('maintenance');
export const amenityBookingService = new FirestoreService('amenityBookings');
export const communityPollService = new FirestoreService('communityPolls');
export const paymentService = new FirestoreService('payments');

// Helper functions for complex operations
export const getMaintenanceStats = async () => {
  try {
    console.log('Getting maintenance stats...');
    const allMaintenance = await maintenanceService.getAll();
    console.log('All maintenance data:', allMaintenance);
    
    if (!allMaintenance.ok || !allMaintenance.data || allMaintenance.data.length === 0) {
      console.log('No maintenance data found, returning zero stats');
      return { open: 0, inProgress: 0, resolved: 0 };
    }
    
    const stats = allMaintenance.data.reduce((acc, item) => {
      const status = item.status?.toLowerCase() || 'open';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const result = {
      open: stats.open || 0,
      inProgress: stats.inprogress || 0,
      resolved: stats.resolved || 0
    };
    console.log('Calculated maintenance stats:', result);
    return result;
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    return { open: 0, inProgress: 0, resolved: 0 };
  }
};

export const getApartmentStats = async () => {
  try {
    const allApartments = await apartmentService.getAll();
    if (!allApartments.ok) return { total: 0, occupied: 0, vacant: 0 };
    
    const stats = allApartments.data.reduce((acc, item) => {
      const status = item.status?.toLowerCase() || 'vacant';
      acc[status] = (acc[status] || 0) + 1;
      acc.total++;
      return acc;
    }, { total: 0 });
    
    return {
      total: stats.total,
      occupied: stats.occupied || 0,
      vacant: stats.vacant || 0
    };
  } catch (error) {
    console.error('Get apartment stats error:', error);
    return { total: 0, occupied: 0, vacant: 0 };
  }
};

export const getPaymentStats = async (userId = null, userRole = 'user') => {
  try {
    const filters = userRole === 'admin' ? {} : { tenantId: userId };
    const allPayments = await paymentService.getAll(filters);
    if (!allPayments.ok) return { paid: 0, pending: 0, overdue: 0 };
    
    const stats = allPayments.data.reduce((acc, item) => {
      const status = item.status?.toLowerCase() || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      paid: stats.paid || 0,
      pending: stats.pending || 0,
      overdue: stats.overdue || 0
    };
  } catch (error) {
    console.error('Get payment stats error:', error);
    return { paid: 0, pending: 0, overdue: 0 };
  }
};
