const express = require("express");
const {
  createPaymentIntent,
  confirmPayment,
} = require("../controllers/payment");

const router = express.Router();

router.post("/create-intent", createPaymentIntent);

module.exports = router;