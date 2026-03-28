const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const overrides = await prisma.availabilityOverride.findMany({
      orderBy: { date: "asc" },
    });
    res.json(overrides);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { date, startTime, endTime, isBlocked } = req.body;

    const override = await prisma.availabilityOverride.create({
      data: {
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
    await prisma.availabilityOverride.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, remove };
