const express = require("express");
const cors = require("cors");

const eventTypesRouter = require("./src/routes/eventTypes");
const availabilityRouter = require("./src/routes/availability");
const overridesRouter = require("./src/routes/overrides");
const slotsRouter = require("./src/routes/slots");
const bookRouter = require("./src/routes/book");
const meetingsRouter = require("./src/routes/meetings");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/event-types", eventTypesRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/overrides", overridesRouter);
app.use("/api/slots", slotsRouter);
app.use("/api/book", bookRouter);
app.use("/api/meetings", meetingsRouter);

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
