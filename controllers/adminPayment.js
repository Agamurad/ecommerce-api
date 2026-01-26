const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { Order } = require("../models/order");
const { Payment } = require("../models/payment");
const { errorMessage, createMessage } = require("../utils/infoMessage");

exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json(errorMessage("Order not found"));
    }

    if (order.status !== "paid") {
      return res
        .status(400)
        .json(errorMessage("Only paid orders can be refunded"));
    }

    const payment = await Payment.findOne({
      order: order._id,
      status: "success",
      provider: "stripe",
    });

    if (!payment) {
      return res.status(404).json(errorMessage("Payment not found"));
    }
    
    await stripe.refunds.create({
      payment_intent: payment.transactionId,
    });

    res.status(200).json(
      createMessage("Refund initiated", {
        orderId: order._id,
        paymentId: payment._id,
      })
    );
  } catch (error) {
    res.status(500).json(errorMessage("Refund failed", error.message));
  }
};