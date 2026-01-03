const express = require('express');
const { listCategory, getCategoryById } = require('../../controllers/category');
const router = express.Router();

router.get("/category/", listCategory);
router.get("/category/:id", getCategoryById);

module.exports = router;