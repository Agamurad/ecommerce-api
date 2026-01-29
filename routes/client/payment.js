const express = require("express");
const router = express.Router();
const { createStripeCheckout } = require("../../controllers/payment");

router.post("/checkout", createStripeCheckout);

module.exports = router;