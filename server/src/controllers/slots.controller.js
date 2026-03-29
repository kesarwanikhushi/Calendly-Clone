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

    // Default to the first schedule of the user if the eventType has no bound schedule
    let scheduleId = eventType.scheduleId;
    if (!scheduleId) {
      const defaultSchedule = await prisma.schedule.findFirst({
        where: { userId: eventType.userId },
        orderBy: { isDefault: "desc" }
      });
      if (!defaultSchedule) return res.json([]);
      scheduleId = defaultSchedule.id;
    }

    const override = await prisma.availabilityOverride.findFirst({
      where: { date, scheduleId },
    });

    let intervals = [];
    let timezone;

    if (override) {
      if (override.isBlocked) {
        return res.json([]);
      }
      intervals.push({ startTime: override.startTime, endTime: override.endTime });

      const sched = await prisma.schedule.findUnique({
        where: { id: scheduleId },
      });
      timezone = sched ? sched.timezone : "UTC";
    } else {
      const availabilities = await prisma.availability.findMany({
        where: { dayOfWeek, scheduleId },
      });

      if (!availabilities || availabilities.length === 0) {
        return res.json([]);
      }

      for (const avail of availabilities) {
        intervals.push({ startTime: avail.startTime, endTime: avail.endTime });
      }
      timezone = availabilities[0].timezone || "UTC";
    }

    const dayStart = startOfDay(parsedDate);
    const dayEnd = endOfDay(parsedDate);

    const bookedMeetings = await prisma.meeting.findMany({
      where: {
        eventTypeId: eventType.id,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
    });

    let slots = [];
    for (const interval of intervals) {
      const intervalSlots = computeFreeSlots(
        interval.startTime,
        interval.endTime,
        eventType.duration,
        eventType.bufferBefore,
        eventType.bufferAfter,
        bookedMeetings,
        date,
        timezone
      );
      slots = slots.concat(intervalSlots);
    }
    
    // Sort slots just in case intervals were out of order
    slots.sort();

    res.json(slots);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSlots };
