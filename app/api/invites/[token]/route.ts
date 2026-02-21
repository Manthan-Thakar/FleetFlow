import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Invite token is required' },
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

    // Get company details
    const companyDoc = await db.collection('companies').doc(inviteData.companyId).get();
    const companyData = companyDoc.data();

    return NextResponse.json({
      success: true,
      invite: {
        email: inviteData.email,
        role: inviteData.role,
        companyId: inviteData.companyId,
        companyName: companyData?.name,
      },
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
