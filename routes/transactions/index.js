const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const UsersDatabase = require("../../models/User");
const { sendDepositEmail, sendUserDepositEmail } = require("../../utils");

// Utility function to find a user
const findUserById = async (id, res) => {
  const user = await UsersDatabase.findOne({ _id: id });
  if (!user) {
    res.status(404).json({
      success: false,
      status: 404,
      message: "User not found",
    });
  }
  return user;
};

// POST /:_id/deposit
router.post("/:_id/deposit", async (req, res) => {
  const { _id } = req.params;
  const { currency, profit, date, amount, status, type } = req.body;

  try {
    const user = await findUserById(_id, res);
    if (!user) return;

    await user.updateOne({
      $push: {
        history: {
          _id: uuidv4(),
          currency,
          amount,
          profit,
          date,
          type,
          status,
        },
      },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Deposit was successful",
    });
  } catch (error) {
    console.error("Error in deposit:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /:_id/deposit/history
router.get("/:_id/deposit/history", async (req, res) => {
  const { _id } = req.params;

  try {
    const user = await findUserById(_id, res);
    if (!user) return;

    res.status(200).json({
      success: true,
      status: 200,
      data: user.history || [],
    });
  } catch (error) {
    console.error("Error fetching deposit history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /:_id/withdrawal
router.post("/:_id/withdrawal", async (req, res) => {
  const { _id } = req.params;
  const { method, address, amount, from, account } = req.body;

  try {
    const user = await findUserById(_id, res);
    if (!user) return;

    await user.updateOne({
      $push: {
        withdrawals: {
          _id: uuidv4(),
          method,
          address,
          amount,
          from,
          account,
          status: "pending",
        },
      },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Withdrawal request was successful",
    });

    sendDepositEmail({ amount, method, from });
  } catch (error) {
    console.error("Error in withdrawal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /:_id/withdrawals/:transactionId/confirm
router.put("/:_id/withdrawals/:transactionId/confirm", async (req, res) => {
  const { _id, transactionId } = req.params;

  try {
    const user = await findUserById(_id, res);
    if (!user) return;

    const withdrawal = user.withdrawals.find((tx) => tx._id === transactionId);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    withdrawal.status = "Approved";

    await user.save();

    res.status(200).json({ success: true, message: "Transaction approved" });
  } catch (error) {
    console.error("Error confirming withdrawal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /:_id/withdrawals/:transactionId/decline
router.put("/:_id/withdrawals/:transactionId/decline", async (req, res) => {
  const { _id, transactionId } = req.params;

  try {
    const user = await findUserById(_id, res);
    if (!user) return;

    const withdrawal = user.withdrawals.find((tx) => tx._id === transactionId);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    withdrawal.status = "Declined";

    await user.save();

    res.status(200).json({ success: true, message: "Transaction declined" });
  } catch (error) {
    console.error("Error declining withdrawal:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /:_id/withdrawals/history
router.get("/:_id/withdrawals/history", async (req, res) => {
  const { _id } = req.params;

  try {
    const user = await findUserById(_id, res);
    if (!user) return;

    res.status(200).json({
      success: true,
      status: 200,
      data: user.withdrawals || [],
    });
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
