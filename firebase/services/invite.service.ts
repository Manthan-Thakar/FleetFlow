import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/firebase/config/firebaseConfig';
import { InviteDriverData } from '@/types';

const functions = getFunctions(app);

/**
 * Invite a driver to the company using Firebase Cloud Function
 * The Cloud Function handles:
 * - Creating Firebase Auth user
 * - Setting custom claims (role: 'driver')
 * - Creating Firestore user document
 * - Sending invitation email
 *
 * @param data - Driver invitation data (driverName, driverEmail, companyName, managerName)
 * @returns Promise with success status and message
 */
export const inviteDriver = async (data: InviteDriverData) => {
  try {
    const sendDriverInvite = httpsCallable(functions, 'sendDriverInvite');
    const result = await sendDriverInvite({
      driverName: data.driverName,
      driverEmail: data.driverEmail,
      companyId: data.companyId,
      companyName: data.companyName,
      managerName: data.managerName,
      phoneNumber: data.phoneNumber,
      licenseNumber: data.licenseNumber,
      licenseType: data.licenseType,
      licenseExpiry: data.licenseExpiry,
      status: data.status || 'available',
      emergencyContact: data.emergencyContact,
    });

    return {
      success: true,
      data: result.data,
      message: 'Driver invited successfully. Check email for credentials.',
    };
  } catch (error: any) {
    console.error('Error inviting driver:', error);
    return {
      success: false,
      error: error.message || 'Failed to invite driver',
      data: null,
    };
  }
};

/**
 * Invite a manager to the company using Firebase Cloud Function
 * @param data - Manager invitation data
 * @returns Promise with success status and message
 */
export const inviteManager = async (data: {
  managerName: string;
  managerEmail: string;
  companyId: string;
  companyName: string;
  adminName?: string;
}) => {
  try {
    const sendManagerInvite = httpsCallable(functions, 'sendManagerInvite');
    const result = await sendManagerInvite({
      managerName: data.managerName,
      managerEmail: data.managerEmail,
      companyId: data.companyId,
      companyName: data.companyName,
      adminName: data.adminName,
    });

    return {
      success: true,
      data: result.data,
      message: 'Manager invited successfully. Check email for credentials.',
    };
  } catch (error: any) {
    console.error('Error inviting manager:', error);
    return {
      success: false,
      error: error.message || 'Failed to invite manager',
      data: null,
    };
  }
};
