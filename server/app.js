const express = require("express");
const cors = require("cors");

const eventTypesRouter = require("./src/routes/eventTypes");
const availabilityRouter = require("./src/routes/availability");
const overridesRouter = require("./src/routes/overrides");
const slotsRouter = require("./src/routes/slots");
const bookRouter = require("./src/routes/book");
const meetingsRouter = require("./src/routes/meetings");
const authRouter = require("./src/routes/auth");
const { authenticate } = require("./src/middleware/auth");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRouter);

// Public routes for booking flow
app.use("/api/slots", slotsRouter);
app.use("/api/book", bookRouter);

// Protected admin routes
app.use("/api/event-types", authenticate, eventTypesRouter);
app.use("/api/availability", authenticate, availabilityRouter);
app.use("/api/overrides", authenticate, overridesRouter);
app.use("/api/meetings", authenticate, meetingsRouter);

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
