// In utils/sendEmail.js
import { google } from 'googleapis';
import dotenv from "dotenv";
dotenv.config();

// --- 1. INITIALIZE GOOGLE AUTH CLIENT ---
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SENDER_EMAIL = process.env.EMAIL_USER;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * 2. HELPER FUNCTION: Creates a base64url encoded email MIME message.
 */
function createRawEmail(to, subject, htmlContent) {
  const raw = [
    `From: "Taskit" <${SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    htmlContent,
  ].join('\r\n');

  return Buffer.from(raw).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email based on the specified type using the Gmail API
 */
export const sendEmail = async (email, code, name, type = 'register', additionalData = {}) => {
  try {
  let subject = '';
  let emailBodyHtml = '';
  
  // Select content based on email type
  switch (type) {
    case 'register':
    subject = 'Welcome to Taskit - Verify Your Email';
    emailBodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #ffffff;">
        <div style="padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px; background-color: #4f46e5;">
          <h2 style="margin: 0; color: #ffffff;">Welcome to Taskit!</h2>
        </div>
        <p style="color: #4b5563; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #4b5563; line-height: 1.5;">Thank you for signing up with Taskit. To complete your registration and access all features, please use the verification code below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #1f2937;">${code}</div>
        <p style="color: #4b5563; line-height: 1.5;">This code will expire in 10 minutes.</p>
        <p style="color: #4b5563; line-height: 1.5;">Taskit is your new task management platform designed to help teams and individuals efficiently organize their projects.</p>
        <p style="color: #4b5563; line-height: 1.5;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #4b5563; line-height: 1.5;">Best regards,<br/>The Taskit Team</p>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
        </div>
        </div>
      </body>
      </html>
    `;
    break;
    
    case 'password':
    subject = 'Taskit - Password Reset Request';
    emailBodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #ffffff;">
        <div style="padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px; background-color: #4f46e5;">
          <h2 style="margin: 0; color: #ffffff;">Password Reset Request</h2>
        </div>
        <p style="color: #4b5563; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #4b5563; line-height: 1.5;">We received a request to reset your password for your Taskit account. To proceed with resetting your password, please use the verification code below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #1f2937;">${code}</div>
        <p style="color: #4b5563; line-height: 1.5;">This code will expire in 10 minutes.</p>
        <p style="color: #4b5563; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="color: #4b5563; line-height: 1.5;">Best regards,<br/>The Taskit Team</p>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">For security reasons, never share this code with anyone.</p>
        </div>
        </div>
      </body>
      </html>
    `;
    break;
    
    case 'delete':
    subject = 'Taskit - Account Deletion Verification';
    emailBodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #ffffff;">
        <div style="padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px; background-color: #dc2626;">
          <h2 style="margin: 0; color: #ffffff;">Account Deletion Request</h2>
        </div>
        <p style="color: #4b5563; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #4b5563; line-height: 1.5;">We received a request to permanently delete your Taskit account. To confirm this action, please use the verification code below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #1f2937;">${code}</div>
        <p style="color: #4b5563; line-height: 1.5;">This code will expire in 10 minutes.</p>
        <p style="color: #4b5563; line-height: 1.5;"><strong>Warning: </strong>This action cannot be undone. All your data, including projects and tasks, will be permanently removed.</p>
        <p style="color: #4b5563; line-height: 1.5;">If you did not request account deletion, please secure your account immediately by changing your password and contact our support team.</p>
        <p style="color: #4b5563; line-height: 1.5;">We're sorry to see you go. If there's anything we can do to improve your experience, please let us know.</p>
        <p style="color: #4b5563; line-height: 1.5;">Best regards,<br/>The Taskit Team</p>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
        </div>
        </div>
      </body>
      </html>
    `;
    break;
    
    case 'email':
    subject = 'Taskit - Email Change Verification';
    emailBodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #ffffff;">
        <div style="padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px; background-color: #0891b2;">
          <h2 style="margin: 0; color: #ffffff;">Email Change Request</h2>
        </div>
        <p style="color: #4b5563; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #4b5563; line-height: 1.5;">We received a request to change the email address associated with your Taskit account. To verify this action, please use the code below:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 4px; color: #1f2937;">${code}</div>
        <p style="color: #4b5563; line-height: 1.5;">This code will expire in 10 minutes.</p>
        <p style="color: #4b5563; line-height: 1.5;">If you did not request an email change, please secure your account immediately by changing your password and contact our support team.</p>
        <p style="color: #4b5563; line-height: 1.5;">Best regards,<br/>The Taskit Team</p>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
        </div>
        </div>
      </body>
      </html>
    `;
    break;
    
    case 'invite':
    const { projectName, inviterName, inviteLink } = additionalData;
    subject = `Taskit - You've Been Invited to Join ${projectName}`;
    emailBodyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #ffffff;">
        <div style="padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px; background-color: #4338ca;">
          <h2 style="margin: 0; color: #ffffff;">Project Invitation</h2>
          <h3 style="margin: 10px 0 0 0; font-weight: 400; color: #ffffff;">You've Been Invited to Join "${projectName}"</h3>
        </div>
        <p style="color: #4b5563; line-height: 1.5;">Hello ${name},</p>
        <p style="color: #4b5563; line-height: 1.5;">${inviterName} has invited you to join the project "${projectName}" on Taskit.</p>
        <p style="color: #4b5563; line-height: 1.5;">To accept this invitation and join the project, please use the button link below:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${inviteLink}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 15px; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: 500;">Accept Invitation</a>
        </p>
        <p style="color: #4b5563; line-height: 1.5;">If the button above does not work, please copy and paste the following link into your web browser:</p>
        <p style="color: #4b5563; line-height: 1.5; word-break: break-all;"><a href="${inviteLink}" style="color: #4f46e5;">${inviteLink}</a></p>
        <p style="color: #4b5563; line-height: 1.5;">This invitation link will expire in 30 days.</p>
        <p style="color: #4b5563; line-height: 1.5;">If you didn't expect this invitation, you can safely ignore this email.</p>
        <p style="color: #4b5563; line-height: 1.5;">Best regards,<br/>The Taskit Team</p>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
        </div>
        </div>
      </body>
      </html>
    `;
    break;
    
    default:
    throw new Error(`Unsupported email type: ${type}`);
  }
  
  // --- 3. CREATE RAW MESSAGE AND SEND VIA GMAIL API ---
  const rawMessage = createRawEmail(email, subject, emailBodyHtml);
  
  const gmail = google.gmail({ 
    version: 'v1', 
    auth: oAuth2Client 
  });
  
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage,
    },
  });
  
  console.log(`Successfully sent ${type} email to ${email}`);
  return true;

  } catch (error) {
  console.error(`Email sending error (${type}):`, error);
  throw new Error(`Failed to send ${type} email: ${error.message}`);
  }
};

// Exports (unchanged)
export const sendVerificationEmail = async (email, verificationCode, name) => {
  return sendEmail(email, verificationCode, name, 'register');
};

export const sendPasswordResetEmail = async (email, resetCode, name) => {
  return sendEmail(email, resetCode, name, 'password');
};

export const sendDeleteAccountEmail = async (email, deleteCode, name) => {
  return sendEmail(email, deleteCode, name, 'delete');
};

export const sendEmailChangeVerification = async (email, changeCode, name) => {
  return sendEmail(email, changeCode, name, 'email');
};

export const sendProjectInvitation = async (email, inviteCode, name, projectName, inviterName, inviteLink) => {
  return sendEmail(email, inviteCode, name, 'invite', { projectName, inviterName, inviteLink });
};