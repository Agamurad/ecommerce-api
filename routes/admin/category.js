const express = require('express');
const { createCategory, updateCategory, deleteCategory } = require('../../controllers/category');
const router = express.Router();

router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;