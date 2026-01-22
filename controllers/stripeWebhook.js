const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");

const { Payment } = require("../models/payment");
const { Order } = require("../models/order");
const { Product } = require("../models/product");

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const allowedEvents = [
    "checkout.session.completed",
    "charge.refunded",
    "payment_intent.payment_failed",
  ];

  if (!allowedEvents.includes(event.type)) {
    return res.json({ received: true });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (event.type === "checkout.session.completed") {
      const data = event.data.object;

      const alreadyHandled = await Payment.findOne({
        stripeEventId: event.id,
      }).session(session);

      if (alreadyHandled) {
        await session.abortTransaction();
        session.endSession();
        return res.json({ received: true });
      }

      const payment = await Payment.findOne({
        transactionId: data.payment_intent,
      }).session(session);

      if (!payment) {
        await session.abortTransaction();
        session.endSession();
        return res.json({ received: true });
      }

      payment.status = "success";
      payment.stripeEventId = event.id;
      await payment.save({ session });

      const order = await Order.findById(payment.order).session(session);

      if (!order || order.status !== "pending") {
        await session.abortTransaction();
        session.endSession();
        return res.json({ received: true });
      }

      order.status = "paid";
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "paid",
        changedBy: null,
      });

      await order.save({ session });
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;

      const payment = await Payment.findOne({
        transactionId: intent.id,
      }).session(session);

      if (!payment || payment.status !== "pending") {
        await session.abortTransaction();
        session.endSession();
        return res.json({ received: true });
      }

      payment.status = "failed";
      payment.stripeEventId = event.id;
      await payment.save({ session });
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object;

      const payment = await Payment.findOne({
        transactionId: charge.payment_intent,
      }).session(session);

      if (!payment || payment.status !== "success") {
        await session.abortTransaction();
        session.endSession();
        return res.json({ received: true });
      }

      payment.status = "refunded";
      payment.stripeEventId = event.id;
      await payment.save({ session });

      const order = await Order.findById(payment.order).session(session);

      if (!order || order.status === "cancelled") {
        await session.abortTransaction();
        session.endSession();
        return res.json({ received: true });
      }

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      order.status = "cancelled";
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "cancelled",
        changedBy: null,
      });

      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({ received: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).end();
  }
};