const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller");

router.post("/", controller.book);

module.exports = router;
