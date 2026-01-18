const express = require("express");
const router = express.Router();
const { stripeWebhook } = require("../controllers/stripeWebhook");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;