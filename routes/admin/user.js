const express = require('express');
const { listUser, singleUser, deleteUser } = require('../../controllers/user');
const router = express.Router();

router.get("/", listUser);
router.get("/:id", singleUser);
router.delete("/", deleteUser);

module.exports = router;