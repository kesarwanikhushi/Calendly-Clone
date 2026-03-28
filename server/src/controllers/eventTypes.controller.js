const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const eventTypes = await prisma.eventType.findMany({
      include: { questions: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(eventTypes);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, duration, slug, bufferBefore, bufferAfter, questions } = req.body;

    const existing = await prisma.eventType.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ error: "Slug already exists" });
    }

    const eventType = await prisma.eventType.create({
      data: {
        name,
        duration,
        slug,
        bufferBefore: bufferBefore || 0,
        bufferAfter: bufferAfter || 0,
        questions: questions && questions.length > 0
          ? { create: questions.map((q) => ({ label: q.label, required: q.required || false, order: q.order })) }
          : undefined,
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    res.status(201).json(eventType);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, duration, slug, bufferBefore, bufferAfter, questions } = req.body;

    const existing = await prisma.eventType.findUnique({ where: { slug } });
    if (existing && existing.id !== Number(id)) {
      return res.status(409).json({ error: "Slug already exists" });
    }

    await prisma.question.deleteMany({ where: { eventTypeId: Number(id) } });

    const eventType = await prisma.eventType.update({
      where: { id: Number(id) },
      data: {
        name,
        duration,
        slug,
        bufferBefore: bufferBefore || 0,
        bufferAfter: bufferAfter || 0,
        questions: questions && questions.length > 0
          ? { create: questions.map((q) => ({ label: q.label, required: q.required || false, order: q.order })) }
          : undefined,
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    res.json(eventType);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const activeMeetings = await prisma.meeting.count({
      where: {
        eventTypeId: Number(id),
        status: "active",
        startTime: { gte: new Date() },
      },
    });

    if (activeMeetings > 0) {
      return res.status(400).json({ error: "Cannot delete event type with active upcoming meetings" });
    }

    await prisma.eventType.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
