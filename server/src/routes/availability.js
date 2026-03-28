const express = require("express");
const router = express.Router();
const controller = require("../controllers/availability.controller");

router.get("/", controller.list);
router.post("/", controller.replace);

module.exports = router;
