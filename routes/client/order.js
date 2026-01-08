const express = require("express");
const { checkout, cancelOrder } = require("../../controllers/order");
const auth = require("../../middleware/auth");
const isAdmin = require("../../middleware/isAdmin");
const router = express.Router();

router.post("/checkout", checkout);
router.put("/:id/cancel", isAdmin, cancelOrder);

module.exports = router;