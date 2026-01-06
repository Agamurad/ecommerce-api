const express = require('express');
const { createCategory, editCategory, deleteCategory } = require('../../controllers/category');
const router = express.Router();

router.post("/", createCategory);
router.put("/:id", editCategory);
router.delete("/:id", deleteCategory);

module.exports = router;