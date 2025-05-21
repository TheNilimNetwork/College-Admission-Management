
// src/utils/emailService.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

// Email templates
const templates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Our College Admission System',
    text: `Dear ${name},\n\nThank you for registering with our college admission system. You can now log in and apply for our programs.\n\nBest regards,\nThe Admission Team`,
    html: `<p>Dear ${name},</p><p>Thank you for registering with our college admission system. You can now log in and apply for our programs.</p><p>Best regards,<br>The Admission Team</p>`,
  }),
  applicationSubmitted: (name: string, applicationNumber: string, programName: string) => ({
    subject: 'Application Submitted Successfully',
    text: `Dear ${name},\n\nYour application (${applicationNumber}) for ${programName} has been submitted successfully. You can check the status of your application by logging into your account.\n\nBest regards,\nThe Admission Team`,
    html: `<p>Dear ${name},</p><p>Your application (${applicationNumber}) for ${programName} has been submitted successfully. You can check the status of your application by logging into your account.</p><p>Best regards,<br>The Admission Team</p>`,
  }),
  applicationStatusUpdate: (name: string, applicationNumber: string, programName: string, status: string) => ({
    subject: 'Application Status Updated',
    text: `Dear ${name},\n\nThe status of your application (${applicationNumber}) for ${programName} has been updated to "${status}". Please log in to your account for more details.\n\nBest regards,\nThe Admission Team`,
    html: `<p>Dear ${name},</p><p>The status of your application (${applicationNumber}) for ${programName} has been updated to "${status}". Please log in to your account for more details.</p><p>Best regards,<br>The Admission Team</p>`,
  }),
  documentVerified: (name: string, documentName: string, status: string) => ({
    subject: 'Document Verification Update',
    text: `Dear ${name},\n\nYour document "${documentName}" has been ${status === 'Approved' ? 'verified and approved' : 'reviewed but needs attention'}. ${status === 'Rejected' ? 'Please log in to your account to see the remarks and resubmit the document.' : ''}\n\nBest regards,\nThe Admission Team`,
    html: `<p>Dear ${name},</p><p>Your document "${documentName}" has been ${status === 'Approved' ? 'verified and approved' : 'reviewed but needs attention'}. ${status === 'Rejected' ? 'Please log in to your account to see the remarks and resubmit the document.' : ''}</p><p>Best regards,<br>The Admission Team</p>`,
  }),
};

// Send email function
export const sendEmail = async (to: string, template: keyof typeof templates, data: any) => {
  try {
    const emailContent = templates[template](...Object.values(data));
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"College Admission" <admissions@college.edu>',
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
    
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Verify email setup
export const verifyEmailSetup = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};