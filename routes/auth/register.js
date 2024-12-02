const express = require("express");
const { hashPassword, sendPasswordOtp, sendWelcomeEmail, resetEmail, sendUserDetails } = require("../../utils");
const UsersDatabase = require("../../models/User");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// Utility function to generate a referral code
function generateReferralCode(length = 6) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
}

// Validation Middleware (for better input handling)
const validateRegistrationInput = (req, res, next) => {
  const { firstName, lastName, email, password, country } = req.body;

  if (!firstName || !lastName || !email || !password || !country) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
  }

  next();
};

// Registration Route
router.post("/register", validateRegistrationInput, async (req, res) => {
  const { firstName, lastName, email, password, country, referralCode } = req.body;

  try {
    // Check if the email is already in use
    const existingUser = await UsersDatabase.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already in use" });
    }

    // Check the referral code (optional)
    let referrer = null;
    if (referralCode) {
      referrer = await UsersDatabase.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code" });
      }
    }

    // Create a new user object
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashPassword(password),
      country,
      kyc: "unverified",
      amountDeposited: "You are not eligible to view the livestream of ongoing trade. Contact support.",
      profit: 0,
      balance: 0,
      copytrading: 0,
      plan: "",
      condition: "",
      referralBonus: 0,
      transactions: [],
      withdrawals: [],
      planHistory: [],
      accounts: {
        eth: { address: "" },
        ltc: { address: "" },
        btc: { address: "" },
        usdt: { address: "" },
      },
      verified: false,
      isDisabled: false,
      referredUsers: [],
      referralCode: generateReferralCode(),
      referredBy: referrer ? referrer._id : null,
    };

    // Save the user to the database
    const createdUser = await UsersDatabase.create(newUser);

    // If referrer exists, update their referred users
    if (referrer) {
      referrer.referredUsers.push(createdUser._id);
      await referrer.save();
    }

    // Send a welcome email
    sendWelcomeEmail({ to: email, token: uuidv4() });

    return res.status(201).json({ success: true, data: createdUser });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Resend OTP Route
router.post("/register/resend", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sendPasswordOtp({ to: email });
    return res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Reset Email Route
router.post("/register/reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    resetEmail({ to: email });
    return res.status(200).json({ success: true, message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error during reset email:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Verify OTP Route
router.post("/register/otp", async (req, res) => {
  const { email, password, firstName } = req.body;

  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    sendUserDetails({ to: email, password, firstName });
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
