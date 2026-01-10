const express = require("express");
const { cancelOrder, updateOrderStatus, getAllOrders } = require("../../controllers/order");
const router = express.Router();

router.put("/:id/cancel", cancelOrder);
router.patch("/:id/status", updateOrderStatus);
router.get("/", auth, isAdmin, getAllOrders);

module.exports = router;