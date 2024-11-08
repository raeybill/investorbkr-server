const bcrypt = require("bcryptjs");
const axios = require("axios");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");

const salt = bcrypt.genSaltSync(10);
const secret = speakeasy.generateSecret({ length: 20 });

// Hashing functions
const hashPassword = (password) => bcrypt.hashSync(password, salt);

const compareHashedPassword = (hashedPassword, password) =>
  bcrypt.compareSync(password, hashedPassword);

// Email transporter setup
const createTransporter = () =>
  nodemailer.createTransport({
    host: "mail.investorbasekr.org",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

// Send OTP function
const generateOtp = () =>
  speakeasy.totp({ secret: secret.base32, encoding: "base32" });

// Functions for sending emails
const sendWithdrawalRequestEmail = async ({ from, amount, method, address }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "support@investorbasekr.org",
    subject: "Transaction Notification",
    html: `
      <html>
      <p>Hello Chief,</p>
      <p>${from} wants to withdraw $${amount} worth of ${method} into ${address} wallet address.</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

const userRegistrationEmail = async ({ firstName, email }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "support@investorbasekr.org",
    subject: "New User Registration",
    html: `
      <html>
      <p>Hello Chief,</p>
      <p>${firstName} with email ${email} just signed up. Please visit your dashboard for confirmation.</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

const sendDepositEmail = async ({ from, amount, method, timestamp }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "support@investorbasekr.org",
    subject: "Transaction Notification",
    html: `
      <html>
      <p>Hello Chief,</p>
      <p>${from} sent $${amount} worth of ${method}. Please confirm the transaction and update their balance on your dashboard.</p>
      <p>Timestamp: ${timestamp}</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

const sendForgotPasswordEmail = async (email) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    html: `
      <html>
      <p>Dear User,</p>
      <p>Forgot your password? Click the link below to reset it:</p>
      <p><a href="https://investorbasekr.org/reset-password">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

const sendVerificationEmail = async ({ from, url }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "support@investorbasekr.org",
    subject: "Account Verification Notification",
    html: `
      <html>
      <p>Hello Chief,</p>
      <p>${from} just verified their IBKR identity.</p>
      <p>Click <a href="${url}">here</a> to view the document.</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

const sendWelcomeEmail = async ({ to }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Account Verification",
    html: `
      <html>
      <h2>Welcome to IBKR</h2>
      <p>Please confirm your email to secure your account.</p>
      <p>Your OTP is: ${generateOtp()}</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

const sendPasswordOtp = async ({ to }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset OTP",
    html: `
      <html>
      <h2>IBKR Password Reset</h2>
      <p>Your OTP is: ${generateOtp()}</p>
      <p>This OTP is valid for a short period. Do not share it with anyone.</p>
      <p>Best wishes,</p>
      <p>IBKR Team</p>
      </html>
    `,
  });
  console.log("Message sent: %s", info.messageId);
};

module.exports = {
  hashPassword,
  compareHashedPassword,
  sendWithdrawalRequestEmail,
  userRegistrationEmail,
  sendDepositEmail,
  sendForgotPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordOtp,
};
