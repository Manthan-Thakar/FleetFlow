const nodemailer = require('nodemailer');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

// Define secrets
const GMAIL_EMAIL = defineSecret('GMAIL_EMAIL');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');
const FRONTEND_URL = defineSecret('FRONTEND_URL');

// Initialize Firebase Admin
admin.initializeApp();

exports.sendDriverInvite = onCall(
  {
    secrets: [GMAIL_EMAIL, GMAIL_APP_PASSWORD, FRONTEND_URL],
  },
  async (request) => {
    try {
      const { driverName, driverEmail, companyName, inviteToken, managerName } = request.data;

      // Validate input
      if (!driverEmail || !driverName || !companyName) {
        throw new HttpsError(
          'invalid-argument',
          'Missing required fields: driverEmail, driverName, companyName'
        );
      }

      // Validate authentication
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'User must be authenticated to send invites'
        );
      }

      // Get frontend URL with fallback
      let frontendUrl = 'https://your-fleetflow-app.com';
      try {
        frontendUrl = FRONTEND_URL.value();
      } catch (error) {
        console.warn('Could not retrieve FRONTEND_URL from secrets, using default');
      }

      const inviteLink = `${frontendUrl}/accept-invite?token=${inviteToken}&type=driver`;

      // Create email transporter with secrets
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_EMAIL.value(),
          pass: GMAIL_APP_PASSWORD.value(),
        },
      });

      const mailOptions = {
        from: `FleetFlow <${GMAIL_EMAIL.value()}>`,
        to: driverEmail,
        subject: `You're Invited to Join ${companyName} on FleetFlow`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h2 style="color: white; margin: 0;">Welcome to FleetFlow!</h2>
            </div>
            
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px;">
              <p>Hi <strong>${driverName}</strong>,</p>
              
              <p>${managerName || 'Your manager'} has invited you to join <strong>${companyName}</strong> on FleetFlow.</p>
              
              <p>FleetFlow is a comprehensive fleet management system designed to streamline your delivery operations.</p>

              <h3 style="color: #374151;">What You'll Be Able To Do:</h3>
              <ul style="color: #595959;">
                <li>View your assigned routes and deliveries</li>
                <li>Track your performance metrics</li>
                <li>Manage your schedule</li>
                <li>Real-time route updates</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Accept Invite
                </a>
              </div>

              <p style="color: #6b7280;">If you have any questions, please contact your manager or support team.</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px;">
                If you did not receive this invitation, please contact your company administrator.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: `Invitation sent to ${driverEmail}`,
      };
    } catch (error) {
      console.error('Error sending driver invite:', error);
      throw new HttpsError(
        'internal',
        error.message || 'Failed to send invitation'
      );
    }
  }
);

exports.sendManagerInvite = onCall(
  {
    secrets: [GMAIL_EMAIL, GMAIL_APP_PASSWORD, FRONTEND_URL],
  },
  async (request) => {
    try {
      const { managerName, managerEmail, companyName, inviteToken, adminName } = request.data;

      // Validate input
      if (!managerEmail || !managerName || !companyName) {
        throw new HttpsError(
          'invalid-argument',
          'Missing required fields: managerEmail, managerName, companyName'
        );
      }

      // Validate authentication
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'User must be authenticated to send invites'
        );
      }

      // Get frontend URL with fallback
      let frontendUrl = 'https://your-fleetflow-app.com';
      try {
        frontendUrl = FRONTEND_URL.value();
      } catch (error) {
        console.warn('Could not retrieve FRONTEND_URL from secrets, using default');
      }

      const inviteLink = `${frontendUrl}/accept-invite?token=${inviteToken}&type=manager`;

      // Create email transporter with secrets
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_EMAIL.value(),
          pass: GMAIL_APP_PASSWORD.value(),
        },
      });

      const mailOptions = {
        from: `FleetFlow <${GMAIL_EMAIL.value()}>`,
        to: managerEmail,
        subject: `You're Invited as a Manager for ${companyName} on FleetFlow`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #3b82f6; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h2 style="color: white; margin: 0;">Welcome to FleetFlow!</h2>
            </div>
            
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px;">
              <p>Hi <strong>${managerName}</strong>,</p>
              
              <p>${adminName || 'Your administrator'} has invited you to join <strong>${companyName}</strong> as a Fleet Manager on FleetFlow.</p>
              
              <p>As a manager, you'll have access to comprehensive fleet management tools to optimize your operations.</p>

              <h3 style="color: #374151;">Manager Capabilities:</h3>
              <ul style="color: #595959;">
                <li>Manage drivers and their assignments</li>
                <li>Plan and optimize delivery routes</li>
                <li>Monitor vehicle fleet in real-time</li>
                <li>View performance analytics and reports</li>
                <li>Manage orders and shipments</li>
                <li>Access comprehensive dashboard</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Accept Invite
                </a>
              </div>

              <p style="color: #6b7280;">If you have any questions, please contact your administrator or support team.</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px;">
                If you did not receive this invitation, please contact your company administrator.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: `Invitation sent to ${managerEmail}`,
      };
    } catch (error) {
      console.error('Error sending manager invite:', error);
      throw new HttpsError(
        'internal',
        error.message || 'Failed to send invitation'
      );
    }
  }
);
