const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

// POST /api/payments - process payment
router.post("/", (req, res) => {
  const { userId, reservationId, amount, method } = req.body;

  if (!userId || !amount || !method) {
    return res.status(400).json({ success: false, message: "userId, amount, method required" });
  }

  const validMethods = ["upi", "card", "wallet"];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ success: false, message: `method must be one of: ${validMethods.join(", ")}` });
  }

  // Simulate payment gateway (90% success rate)
  const paymentSuccess = Math.random() > 0.1;

  const payment = {
    id: uuidv4(),
    userId,
    reservationId: reservationId || null,
    amount,
    currency: "INR",
    method,
    status: paymentSuccess ? "success" : "failed",
    transactionId: paymentSuccess ? `TXN_${Date.now()}` : null,
    timestamp: new Date().toISOString(),
  };

  db.addPayment(payment);
  db.logAnalytics({ event: "payment", paymentId: payment.id, status: payment.status, amount, method });

  if (!paymentSuccess) {
    return res.status(402).json({ success: false, message: "Payment failed. Please try again.", payment });
  }

  // Mark reservation as paid if provided
  if (reservationId) {
    db.updateReservation(reservationId, { status: "paid", paymentId: payment.id });
  }

  res.json({
    success: true,
    message: `Payment of ₹${amount} via ${method.toUpperCase()} successful`,
    payment,
  });
});

// GET /api/payments/:id - get payment details
router.get("/:id", (req, res) => {
  const payment = db.getPayment(req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  res.json({ success: true, payment });
});

module.exports = router;
