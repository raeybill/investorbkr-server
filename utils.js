const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

// Hashing functions
const salt = bcrypt.genSaltSync(10);
const hashPassword = (password) => bcrypt.hashSync(password, salt);
const compareHashedPassword = (hashedPassword, password) =>
  bcrypt.compareSync(password, hashedPassword);

// Email transporter setup
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Missing email credentials in environment variables.");
  }

  return nodemailer.createTransport({
    host: "mail.investorbasekr.org",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// OTP Generator
const generateOtp = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  return speakeasy.totp({ secret: secret.base32, encoding: "base32" });
};

// Email Templates
const emailTemplates = {
  withdrawalRequest: ({ from, amount, method, address }) => `
    <p>Dear IBKR Support Team,</p>
    <p>I am writing to inform you that a withdrawal request has been submitted by the account holder identified as <strong>${from}</strong>.</p>
    <p>The details of the transaction are as follows:</p>
    <ul>
      <li><strong>Amount:</strong> $${amount}</li>
      <li><strong>Method:</strong> ${method}</li>
      <li><strong>Wallet Address:</strong> ${address}</li>
    </ul>
    <p>Please review the details of this transaction promptly. If everything is in order, kindly proceed with the withdrawal process.</p>
    <p>Thank you for your attention to this matter.</p>
    <p>Best regards,</p>
    <p>The IBKR Team</p>
  `,

  userRegistration: ({ firstName, email }) => `
    <p>Dear IBKR Support Team,</p>
    <p>This is to notify you of a new user registration on the platform. The details of the registrant are as follows:</p>
    <ul>
      <li><strong>Name:</strong> ${firstName}</li>
      <li><strong>Email Address:</strong> ${email}</li>
    </ul>
    <p>Please take the necessary steps to verify and confirm the user account.</p>
    <p>Thank you for ensuring a smooth onboarding process for our users.</p>
    <p>Sincerely,</p>
    <p>The IBKR Team</p>
  `,

  forgotPassword: (otp) => `
    <p>Dear Valued User,</p>
    <p>We have received a request to reset the password associated with your IBKR account. To ensure the security of your account, please use the One-Time Password (OTP) provided below to proceed with the password reset:</p>
    <p><strong>OTP:</strong> ${otp}</p>
    <p>This OTP is valid for a limited time and should not be shared with anyone. If you did not request a password reset, please disregard this email and notify us immediately by contacting support at <a href="mailto:support@investorbasekr.org">support@investorbasekr.org</a>.</p>
    <p>Thank you for choosing IBKR. Your security is our top priority.</p>
    <p>Warm regards,</p>
    <p>The IBKR Support Team</p>
  `,

  welcomeEmail: ({ to, otp }) => `
    <p>Dear ${to},</p>
    <p>Welcome to InvestorBase KR (IBKR)! We are delighted to have you join our platform, where we strive to provide you with a seamless and secure trading experience.</p>
    <p>To activate your account and verify your email address, please use the following One-Time Password (OTP):</p>
    <p><strong>OTP:</strong> ${otp}</p>
    <p>Please note that this OTP is valid for a short period and should not be shared with anyone to ensure the security of your account.</p>
    <p>If you encounter any difficulties or have questions, do not hesitate to reach out to our support team at <a href="mailto:support@investorbasekr.org">support@investorbasekr.org</a>.</p>
    <p>We look forward to serving you and helping you achieve your financial goals.</p>
    <p>Warm regards,</p>
    <p>The IBKR Team</p>
  `,
};

// Helper to send email
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
  console.log("Message sent: %s", info.messageId);
};

// Email Sending Functions
const sendWithdrawalRequestEmail = async (data) => {
  await sendEmail({
    to: "support@investorbasekr.org",
    subject: "Transaction Notification",
    html: emailTemplates.withdrawalRequest(data),
  });
};

const userRegistrationEmail = async (data) => {
  await sendEmail({
    to: "support@investorbasekr.org",
    subject: "New User Registration",
    html: emailTemplates.userRegistration(data),
  });
};

const sendForgotPasswordEmail = async (email) => {
  const otp = generateOtp();
  await sendEmail({
    to: email,
    subject: "Password Reset",
    html: emailTemplates.forgotPassword(otp),
  });
};

const sendWelcomeEmail = async (data) => {
  const otp = generateOtp();
  await sendEmail({
    to: data.to,
    subject: "Welcome to IBKR",
    html: emailTemplates.welcomeEmail({ ...data, otp }),
  });
};

// Exports
module.exports = {
  hashPassword,
  compareHashedPassword,
  sendWithdrawalRequestEmail,
  userRegistrationEmail,
  sendForgotPasswordEmail,
  sendWelcomeEmail,
};
