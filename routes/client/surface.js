const express = require('express');
const { listCategory, getCategoryById } = require('../../controllers/category');
const { listProduct, getProductById } = require('../../controllers/product');
const router = express.Router();

router.get("/category", listCategory);
router.get("/category/:id", getCategoryById);

router.get("/product", listProduct);
router.get("/product/:id", getProductById);

module.exports = router;