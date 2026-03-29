const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) return res.status(400).json({ error: "scheduleId is required" });

    const records = await prisma.availability.findMany({
      where: {
        scheduleId: Number(scheduleId),
        schedule: { userId: req.user.id }
      },
      orderBy: { dayOfWeek: "asc" },
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function replace(req, res, next) {
  try {
    const { scheduleId, timezone, days } = req.body;
    if (!scheduleId) return res.status(400).json({ error: "scheduleId is required" });

    // Ensure the schedule belongs to the user
    const schedule = await prisma.schedule.findFirst({
      where: { id: Number(scheduleId), userId: req.user.id }
    });
    if (!schedule) return res.status(403).json({ error: "Unauthorized or schedule not found" });

    await prisma.availability.deleteMany({
      where: { scheduleId: Number(scheduleId) },
    });

    if (days && days.length > 0) {
      await prisma.availability.createMany({
        data: days.map((d) => ({
          scheduleId: Number(scheduleId),
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
          timezone: timezone || schedule.timezone,
        })),
      });
    }

    const records = await prisma.availability.findMany({
      where: { scheduleId: Number(scheduleId) },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, replace };
