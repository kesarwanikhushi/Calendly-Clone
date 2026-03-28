const express = require("express");
const router = express.Router();
const controller = require("../controllers/slots.controller");

router.get("/", controller.getSlots);

module.exports = router;
