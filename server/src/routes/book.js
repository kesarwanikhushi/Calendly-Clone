const express = require("express");
const router = express.Router();
const controller = require("../controllers/book.controller");

router.post("/", controller.book);
router.get("/users/:userId/event-types", controller.getUserPublicEventTypes);
router.get("/types/:slug", controller.getEventBySlug);
router.get("/meetings/:id", controller.getMeetingById);
router.patch("/meetings/:id", controller.rescheduleMeeting);

module.exports = router;
