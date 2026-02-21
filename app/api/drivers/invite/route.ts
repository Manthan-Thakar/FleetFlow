import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();
const auth = getAuth();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverName, driverEmail, phoneNumber, companyId, role } = body;

    // Validate required fields
    if (!driverName || !driverEmail || !companyId) {
      return NextResponse.json(
        { error: 'Missing required fields: driverName, driverEmail, companyId' },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get current user's company
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Verify user is authorized to add drivers (must be admin or manager)
    if (userData?.role !== 'admin' && userData?.role !== 'manager') {
      return NextResponse.json(
        { error: 'Not authorized to add drivers' },
        { status: 403 }
      );
    }

    // Verify company belongs to user
    if (userData?.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Company mismatch' },
        { status: 403 }
      );
    }

    // Generate unique invite token
    const inviteToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);

    // Create invite record in Firestore
    const inviteRef = db.collection('invites').doc();
    await inviteRef.set({
      email: driverEmail,
      role: role || 'driver',
      companyId,
      createdBy: decodedToken.uid,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      used: false,
      token: inviteToken,
    });

    // Get company details
    const companyDoc = await db.collection('companies').doc(companyId).get();
    const companyName = companyDoc.data()?.name || 'FleetFlow';

    return NextResponse.json(
      {
        success: true,
        message: `Invitation created for ${driverEmail}. Email will be sent via cloud function.`,
        inviteId: inviteRef.id,
        inviteToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating driver invite:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
