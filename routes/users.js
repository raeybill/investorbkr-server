var express = require("express");
const UsersDatabase = require("../models/User");
const { hashPassword } = require("../utils");
var router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await UsersDatabase.find();
    res.status(200).json({ code: "Ok", data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Get user by email
router.get("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await UsersDatabase.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ code: "Ok", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving user" });
  }
});

// Delete user by email
router.delete("/:email/delete", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await UsersDatabase.findOneAndDelete({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ code: "Ok", message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Update user profile by ID
router.put("/:_id/profile/update", async (req, res) => {
  const { _id } = req.params;
  try {
    const user = await UsersDatabase.findByIdAndUpdate(_id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated successfully", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// Update user accounts by ID
router.put("/:_id/accounts/update", async (req, res) => {
  const { _id } = req.params;
  const accountUpdates = JSON.parse(req.body.values);
  try {
    const user = await UsersDatabase.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accounts = { ...user.accounts, ...accountUpdates };
    await user.save();

    res.status(200).json({ message: "Account updated successfully", data: user.accounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating account" });
  }
});

// Get user accounts by ID
router.get("/:_id/accounts", async (req, res) => {
  const { _id } = req.params;
  try {
    const user = await UsersDatabase.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Account retrieved successfully", data: user.accounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving account" });
  }
});

module.exports = router;
