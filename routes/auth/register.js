// register.js
var express = require("express");
var { hashPassword, sendPasswordOtp, userRegisteration, sendWelcomeEmail, resetEmail, sendUserDetails } = require("../../utils");
const UsersDatabase = require("../../models/User");
var router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Function to generate a referral code
function generateReferralCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Registration endpoint
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, country, referralCode, phone } = req.body;
  try {
    // Check for existing email
    const user = await UsersDatabase.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "Email address is already taken" });
    }

    // Handle referral code
    let referrer = null;
    if (referralCode) {
      referrer = await UsersDatabase.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code" });
      }
    }

    // Create new user
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashPassword(password),
      country,
      phone,
      referralCode: generateReferralCode(6),
      verified: false,
      isDisabled: false,
      referredBy: referrer ? referrer._id : null,
      referredUsers: []
    };

    // Add referred user to referrer's list
    if (referrer) {
      referrer.referredUsers.push(newUser._id);
      await referrer.save();
    }

    // Save new user and send welcome email
    const createdUser = await UsersDatabase.create(newUser);
    const token = uuidv4();
    sendWelcomeEmail({ to: email, token });
    return res.status(200).json({ code: "Ok", data: createdUser });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// OTP Resend Endpoint
router.post("/register/resend", async (req, res) => {
  const { email } = req.body;
  const user = await UsersDatabase.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  try {
    sendPasswordOtp({ to: email });
    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.log(error);
  }
});

// Export the router
module.exports = router;
