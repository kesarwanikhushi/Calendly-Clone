const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) return res.status(400).json({ error: "scheduleId is required" });

    const overrides = await prisma.availabilityOverride.findMany({
      where: { 
        scheduleId: Number(scheduleId),
        schedule: { userId: req.user.id } 
      },
      orderBy: { date: "asc" },
    });
    res.json(overrides);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { scheduleId, date, startTime, endTime, isBlocked } = req.body;
    if (!scheduleId) return res.status(400).json({ error: "scheduleId is required" });

    const schedule = await prisma.schedule.findFirst({
      where: { id: Number(scheduleId), userId: req.user.id }
    });
    if (!schedule) return res.status(403).json({ error: "Unauthorized" });

    const override = await prisma.availabilityOverride.create({
      data: {
        scheduleId: Number(scheduleId),
        date,
        startTime: isBlocked ? null : startTime,
        endTime: isBlocked ? null : endTime,
        isBlocked: !!isBlocked,
      },
    });

    res.status(201).json(override);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const current = await prisma.availabilityOverride.findUnique({ 
      where: { id: Number(req.params.id) },
      include: { schedule: true }
    });

    if (!current || current.schedule.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.availabilityOverride.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
