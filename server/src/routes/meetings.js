const express = require("express");
const router = express.Router();
const controller = require("../controllers/meetings.controller");

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.patch("/:id", controller.patch);

module.exports = router;
