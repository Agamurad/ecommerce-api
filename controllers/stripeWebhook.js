const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');

const { Payment } = require("../models/payment");
const { Order } = require("../models/order");

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (event.type === "checkout.session.completed") {
        const data = event.data.object;

        const existing = await Payment.findOne({
            stripeEventId: event.id,
        }).session(session);

        if (existing) {
            return res.json({ received: true });
        }

        const payment = await Payment.findOne({
            transactionId: data.payment_intent,
        }).session(session);

        if (!payment) {
            await session.abortTransaction();
            return res.json({ received: true });
        }

        payment.status = "success";
        payment.stripeEventId = event.id;
        await payment.save({ session });

        const order = await Order.findById(payment.order).session(session);

        if (!order || order.status !== "pending") {
            await session.abortTransaction();
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

    await session.commitTransaction();
    session.endSession();

    res.json({ received: true });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).end();
  }
};