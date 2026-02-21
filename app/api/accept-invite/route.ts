import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

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
    const { token, email, password, displayName } = body;

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: token, email, password' },
        { status: 400 }
      );
    }

    // Find invite by token
    const invitesSnapshot = await db
      .collection('invites')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (invitesSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    const inviteDoc = invitesSnapshot.docs[0];
    const inviteData = inviteDoc.data();

    // Check if expired
    if (inviteData.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 410 }
      );
    }

    // Check if already used
    if (inviteData.used) {
      return NextResponse.json(
        { error: 'Invite has already been used' },
        { status: 410 }
      );
    }

    // Verify email matches
    if (inviteData.email !== email) {
      return NextResponse.json(
        { error: 'Email does not match invite' },
        { status: 400 }
      );
    }

    try {
      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName || inviteData.email.split('@')[0],
      });

      // Create Firestore user document
      await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        displayName: userRecord.displayName || null,
        role: inviteData.role,
        companyId: inviteData.companyId,
        photoURL: null,
        phoneNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        status: 'active',
      });

      // Mark invite as used
      await inviteDoc.ref.update({
        used: true,
        usedAt: new Date(),
        usedBy: userRecord.uid,
      });

      // Get company details for response
      const companyDoc = await db.collection('companies').doc(inviteData.companyId).get();
      const companyData = companyDoc.data();

      return NextResponse.json({
        success: true,
        message: `User account created successfully`,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role: inviteData.role,
          companyId: inviteData.companyId,
          companyName: companyData?.name,
        },
      });
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: 'Email is already registered' },
          { status: 400 }
        );
      }
      if (authError.code === 'auth/weak-password') {
        return NextResponse.json(
          { error: 'Password should be at least 6 characters' },
          { status: 400 }
        );
      }
      throw authError;
    }
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
