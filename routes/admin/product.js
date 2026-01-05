const express = require('express');
const { createProduct, editProduct, deleteProduct } = require('../../controllers/product');
const router = express.Router();

router.post("/", createProduct);
router.put("/:id", editProduct);
router.delete("/:id", deleteProduct);

module.exports = router;