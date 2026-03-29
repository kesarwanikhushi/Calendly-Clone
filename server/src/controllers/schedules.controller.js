const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { userId: req.user.id }
    });
    res.json(schedules);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, timezone, isDefault } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        userId: req.user.id,
        name,
        timezone,
        isDefault
      }
    });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, timezone, isDefault } = req.body;
    
    const schedule = await prisma.schedule.updateMany({
      where: { id, userId: req.user.id },
      data: {
        name,
        timezone,
        isDefault
      }
    });
    
    if (schedule.count === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    const updated = await prisma.schedule.findUnique({ where: { id } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    
    const count = await prisma.schedule.deleteMany({
      where: { id, userId: req.user.id }
    });
    
    if (count.count === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create,
  update,
  remove
};

