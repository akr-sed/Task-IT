// In utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email based on the specified type
 * @param {string} email - Recipient's email address
 * @param {number} code - Verification/Reset code
 * @param {string} name - Recipient's name
 * @param {string} type - Email type ('register', 'password', 'delete', 'email', 'invite')
 * @param {object} additionalData - Additional data needed for specific email types
 * @returns {Promise<boolean>} - Success status
 */
export const sendEmail = async (email, code, name, type = 'register', additionalData = {}) => {
  try {
    let subject = '';
    let htmlContent = '';
    
    // Common styles
    const styles = `
      .container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        background-color: #ffffff;
      }
      .header {
        background-color: #4f46e5;
        padding: 20px;
        color: white;
        text-align: center;
        border-radius: 8px 8px 0 0;
        margin-bottom: 20px;
      }
      .footer {
        background-color: #f9fafb;
        padding: 15px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-radius: 0 0 8px 8px;
        margin-top: 20px;
      }
      .code-container {
        background-color: #f3f4f6;
        padding: 15px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 5px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .btn {
        background-color: #4f46e5;
        color: white;
        padding: 10px 15px;
        text-decoration: none;
        display: inline-block;
        border-radius: 4px;
        margin-top: 10px;
        font-weight: 500;
      }
      p {
        color: #4b5563;
        line-height: 1.5;
      }
    `;
    
    // Select content based on email type
    switch (type) {
      case 'register':
        subject = 'Welcome to Taskit - Verify Your Email';
        htmlContent = `
          <div class="container">
            <div class="header">
              <h2>Welcome to Taskit!</h2>
            </div>
            <p>Hello ${name},</p>
            <p>Thank you for signing up with Taskit. To complete your registration and access all features, please use the verification code below:</p>
            <div class="code-container">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>Taskit is your new task management platform designed to help teams and individuals efficiently organize their projects.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>Best regards,<br/>The Taskit Team</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
        
      case 'password':
        subject = 'Taskit - Password Reset Request';
        htmlContent = `
          <div class="container">
            <div class="header">
              <h2>Password Reset Request</h2>
            </div>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password for your Taskit account. To proceed with resetting your password, please use the verification code below:</p>
            <div class="code-container">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br/>The Taskit Team</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
              <p>For security reasons, never share this code with anyone.</p>
            </div>
          </div>
        `;
        break;
        
      case 'delete':
        subject = 'Taskit - Account Deletion Verification';
        htmlContent = `
          <div class="container">
            <div class="header" style="background-color: #dc2626;">
              <h2>Account Deletion Request</h2>
            </div>
            <p>Hello ${name},</p>
            <p>We received a request to permanently delete your Taskit account. To confirm this action, please use the verification code below:</p>
            <div class="code-container">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p><strong>Warning: </strong>This action cannot be undone. All your data, including projects and tasks, will be permanently removed.</p>
            <p>If you did not request account deletion, please secure your account immediately by changing your password and contact our support team.</p>
            <p>We're sorry to see you go. If there's anything we can do to improve your experience, please let us know.</p>
            <p>Best regards,<br/>The Taskit Team</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
        
      case 'email':
        subject = 'Taskit - Email Change Verification';
        htmlContent = `
          <div class="container">
            <div class="header" style="background-color: #0891b2;">
              <h2>Email Change Request</h2>
            </div>
            <p>Hello ${name},</p>
            <p>We received a request to change the email address associated with your Taskit account. To verify this action, please use the code below:</p>
            <div class="code-container">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request an email change, please secure your account immediately by changing your password and contact our support team.</p>
            <p>Best regards,<br/>The Taskit Team</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
        
      case 'invite':
        const { projectName, inviterName, inviteLink } = additionalData;
        subject = `Taskit - You've Been Invited to Join ${projectName}`;
        htmlContent = `
          <div class="container">
            <div class="header" style="background-color: #4338ca;">
              <h2>Project Invitation</h2>
              <h3>You've Been Invited to Join "${projectName}"</h3>
            </div>
            <p>Hello ${name},</p>
            <p>${inviterName} has invited you to join the project "${projectName}" on Taskit.</p>
            <p>To accept this invitation and join the project, please use the button link below:</p>
            <p style="text-align: center;">
              <a href="${inviteLink}" class="btn"><span style="color: #fff;">Accept Invitation</span></a>
            </p>
            <p>If the button above does not work, please copy and paste the following link into your web browser:</p>
            <p><a href="${inviteLink}">${inviteLink}</a></p>
            <p>This invitation link will expire in 30 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>Best regards,<br/>The Taskit Team</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Taskit. All rights reserved.</p>
            </div>
          </div>
        `;
        break;
        
      default:
        throw new Error(`Unsupported email type: ${type}`);
    }
    
    // Add the styles to the HTML content
    const finalHtmlContent = `
      <html>
        <head>
          <style>${styles}</style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Taskit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: finalHtmlContent
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Email sending error (${type}):`, error);
    throw new Error(`Failed to send ${type} email`);
  }
};

// For backward compatibility
export const sendVerificationEmail = async (email, verificationCode, name) => {
  return sendEmail(email, verificationCode, name, 'register');
};

// Additional export for specific email types
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

