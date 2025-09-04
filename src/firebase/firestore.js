// Firestore utilities for Travel Adventures
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// User-generated trips (separate from CMS trips)
export const userTrips = {
  // Add a new user trip
  add: async (tripData, userId) => {
    try {
      const docRef = await addDoc(collection(db, 'userTrips'), {
        ...tripData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  },

  // Get trips by user
  getByUser: async (userId) => {
    try {
      const q = query(
        collection(db, 'userTrips'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user trips:', error);
      throw error;
    }
  },

  // Update a trip
  update: async (tripId, updateData) => {
    try {
      await updateDoc(doc(db, 'userTrips', tripId), {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  },

  // Delete a trip
  delete: async (tripId) => {
    try {
      await deleteDoc(doc(db, 'userTrips', tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }
};

// User favorites (for CMS content)
export const favorites = {
  // Add to favorites
  add: async (userId, itemId, itemType = 'trip') => {
    try {
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        itemId,
        itemType, // 'trip', 'activity', etc.
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Remove from favorites
  remove: async (userId, itemId) => {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('itemId', '==', itemId)
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // Get user favorites
  getByUser: async (userId) => {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  },

  // Check if item is favorited
  isFavorited: async (userId, itemId) => {
    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('itemId', '==', itemId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }
};

// User reviews
export const reviews = {
  // Add a review
  add: async (reviewData, userId) => {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Get reviews for an item
  getByItem: async (itemId, itemType = 'trip') => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('itemId', '==', itemId),
        where('itemType', '==', itemType),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  // Get reviews by user
  getByUser: async (userId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }
};

// Generic utility functions
export const firestoreUtils = {
  // Get document by ID
  getById: async (collectionName, docId) => {
    try {
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Get all documents from a collection
  getAll: async (collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting all documents from ${collectionName}:`, error);
      throw error;
    }
  }
}; 