const prisma = require("../lib/prisma");
const { parseISO, getDay, startOfDay, endOfDay } = require("date-fns");
const { computeFreeSlots } = require("../lib/slots");

async function getSlots(req, res, next) {
  try {
    const { slug, date } = req.query;

    if (!slug || !date) {
      return res.status(400).json({ error: "slug and date are required" });
    }

    const eventType = await prisma.eventType.findUnique({ where: { slug } });
    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    const parsedDate = parseISO(date);
    const dayOfWeek = getDay(parsedDate);

    const override = await prisma.availabilityOverride.findFirst({
      where: { date, userId: eventType.userId },
    });

    let startTime, endTime, timezone;

    if (override) {
      if (override.isBlocked) {
        return res.json([]);
      }
      startTime = override.startTime;
      endTime = override.endTime;

      const avail = await prisma.availability.findFirst({
        where: { userId: eventType.userId },
      });
      timezone = avail ? avail.timezone : "UTC";
    } else {
      const availability = await prisma.availability.findFirst({
        where: { dayOfWeek, userId: eventType.userId },
      });

      if (!availability) {
        return res.json([]);
      }

      startTime = availability.startTime;
      endTime = availability.endTime;
      timezone = availability.timezone;
    }

    const dayStart = startOfDay(parsedDate);
    const dayEnd = endOfDay(parsedDate);

    const bookedMeetings = await prisma.meeting.findMany({
      where: {
        eventTypeId: eventType.id,
        status: "active",
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
    });

    const slots = computeFreeSlots(
      startTime,
      endTime,
      eventType.duration,
      eventType.bufferBefore,
      eventType.bufferAfter,
      bookedMeetings,
      date,
      timezone
    );

    res.json(slots);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSlots };
