const express = require("express");
const router = express.Router();
const controller = require("../controllers/overrides.controller");

router.get("/", controller.list);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

module.exports = router;
