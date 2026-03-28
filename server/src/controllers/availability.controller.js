const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const records = await prisma.availability.findMany({
      where: { userId: req.user.id },
      orderBy: { dayOfWeek: "asc" },
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function replace(req, res, next) {
  try {
    const { timezone, days } = req.body;

    await prisma.availability.deleteMany({
      where: { userId: req.user.id },
    });

    if (days && days.length > 0) {
      await prisma.availability.createMany({
        data: days.map((d) => ({
          userId: req.user.id,
          dayOfWeek: d.dayOfWeek,
          startTime: d.startTime,
          endTime: d.endTime,
          timezone: timezone || "UTC",
        })),
      });
    }

    const records = await prisma.availability.findMany({
      where: { userId: req.user.id },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, replace };
