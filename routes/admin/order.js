const express = require("express");
const { cancelOrder } = require("../../controllers/order");
const router = express.Router();

router.put("/:id/cancel", cancelOrder);
router.get("/", auth, isAdmin, getAllOrders);

module.exports = router;