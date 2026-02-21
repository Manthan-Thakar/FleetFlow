import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface InviteDriverRequest {
  driverName: string;
  driverEmail: string;
  companyName: string;
  managerName?: string;
}

interface InviteManagerRequest {
  managerName: string;
  managerEmail: string;
  companyName: string;
  adminName?: string;
}

interface InviteResponse {
  success: boolean;
  message: string;
}

/**
 * Send an invitation to a driver using Firebase Cloud Function
 * This creates auth account and sends email with credentials
 * @param data - Driver invite details
 * @returns Promise with invite response
 */
export const inviteDriver = async (data: InviteDriverRequest): Promise<InviteResponse> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const functions = getFunctions();
    const sendDriverInvite = httpsCallable(functions, 'sendDriverInvite');

    const result = await sendDriverInvite({
      driverName: data.driverName,
      driverEmail: data.driverEmail,
      companyName: data.companyName,
      managerName: data.managerName,
    });

    return result.data as InviteResponse;
  } catch (error: any) {
    console.error('Error inviting driver:', error);
    throw new Error(error.message || 'Failed to send driver invitation');
  }
};

/**
 * Send an invitation to a manager using Firebase Cloud Function
 * This creates auth account and sends email with credentials
 * @param data - Manager invite details
 * @returns Promise with invite response
 */
export const inviteManager = async (data: InviteManagerRequest): Promise<InviteResponse> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const functions = getFunctions();
    const sendManagerInvite = httpsCallable(functions, 'sendManagerInvite');

    const result = await sendManagerInvite({
      managerName: data.managerName,
      managerEmail: data.managerEmail,
      companyName: data.companyName,
      adminName: data.adminName,
    });

    return result.data as InviteResponse;
  } catch (error: any) {
    console.error('Error inviting manager:', error);
    throw new Error(error.message || 'Failed to send manager invitation');
  }
};

/**
 * Batch invite multiple drivers
 * @param drivers - Array of drivers to invite
 * @param companyName - Company name
 * @param managerName - Manager name (optional)
 * @returns Promise with array of results
 */
export const batchInviteDrivers = async (
  drivers: Array<{ name: string; email: string }>,
  companyName: string,
  managerName?: string
) => {
  const results = [];

  for (const driver of drivers) {
    try {
      const result = await inviteDriver({
        driverName: driver.name,
        driverEmail: driver.email,
        companyName,
        managerName,
      });
      results.push({ success: true, driver: driver.email, result });
    } catch (error) {
      results.push({
        success: false,
        driver: driver.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};

/**
 * Get invite details by token
 * @param token - Invite token
 * @returns Promise with invite details
 */
export const getInviteDetails = async (token: string) => {
  try {
    const response = await fetch(`/api/invites/${token}`);

    if (!response.ok) {
      throw new Error('Invite not found or expired');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching invite details:', error);
    throw error;
  }
};

/**
 * Accept an invite and create user account
 * @param token - Invite token
 * @param password - User password for new account
 * @returns Promise with user creation response
 */
export const acceptInvite = async (token: string, password: string) => {
  try {
    const response = await fetch('/api/accept-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept invite');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw error;
  }
};
