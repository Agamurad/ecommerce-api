const { Order } = require("../models/order");
const { Payment } = require("../models/payment");
const { errorMessage, createMessage } = require("../utils/infoMessage");
const crypto = require("crypto");

exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json(errorMessage("Order not found"));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json(errorMessage("Access denied"));
    }

    if (order.status !== "pending") {
      return res.status(400).json(errorMessage("Order already paid"));
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
      status: "pending",
    });

    if (existingPayment) {
      return res.status(400).json(errorMessage("Payment already in progress"));
    }

    const payment = new Payment({
      order: order._id,
      user: req.user._id,
      amount: order.totalPrice,
      provider: "mock",
      transactionId: crypto.randomUUID(),
    });

    await payment.save();

    res.status(201).json(
      createMessage("Payment intent created", {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
      })
    );
  } catch (error) {
    res.status(500).json(errorMessage("Payment failed", error.message));
  }
};