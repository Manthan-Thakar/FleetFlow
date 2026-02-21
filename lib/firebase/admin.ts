// lib/firebase/admin.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK for server-side operations
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !privateKey) {
    console.warn(
      '⚠️ Firebase Admin SDK is not configured. API routes requiring admin access will not work.'
    );
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`,
        storageBucket: `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`,
      });

      console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
      console.error('❌ Firebase Admin SDK initialization failed:', error);
    }
  }
}

// Export Admin SDK instances
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

// Helper function to verify Firebase ID token
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

// Helper function to get user document with role
export async function getUserWithRole(uid: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return {
      uid,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export default admin;
