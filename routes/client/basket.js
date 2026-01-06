const express = require('express');
const { getBasket, addBasket, editBasketItem, removeFromBasket, clearBasket } = require('../../controllers/basket');
const router = express.Router();

router.get("/", getBasket);
router.post("/add", addBasket);
router.put("/update", editBasketItem);
router.delete("/remove/:productId", removeFromBasket);
router.delete("/clear", clearBasket);

module.exports = router;