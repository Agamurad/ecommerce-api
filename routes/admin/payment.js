const express = require("express");
const router = express.Router();
const { refundPayment } = require("../../controllers/adminPayment");

router.post("/refund/:orderId", refundPayment);

module.exports = router;