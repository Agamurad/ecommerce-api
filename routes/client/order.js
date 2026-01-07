const express = require("express");
const { checkout } = require("../../controllers/order");
const router = express.Router();

router.post("/checkout", checkout);

module.exports = router;