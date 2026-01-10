const express = require("express");
const { checkout, getUserOrders } = require("../../controllers/order");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const router = express.Router();

router.post("/checkout", checkout);
router.get("/my", getUserOrders);

module.exports = router;