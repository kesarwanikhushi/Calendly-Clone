const prisma = require("../lib/prisma");
const { getDay } = require("date-fns");
const { utcToZonedTime, zonedTimeToUtc } = require("date-fns-tz");
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

    // Load schedule to get timezone so we compute day-of-week and day bounds in the
    // schedule's timezone (avoids off-by-one/day issues across zones).
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    const timezone = schedule ? schedule.timezone : "UTC";

    // Interpret the incoming date (YYYY-MM-DD) as the calendar date in the schedule timezone.
    // Compute zoned midnight and derive the day-of-week from it.
    const utcMidnightForDate = zonedTimeToUtc(`${date} 00:00:00`, timezone);
    const zonedMidnight = utcToZonedTime(utcMidnightForDate, timezone);
    const dayOfWeek = getDay(zonedMidnight);

    const override = await prisma.availabilityOverride.findFirst({
      where: { date, scheduleId },
    });

    let intervals = [];

    if (override) {
      if (override.isBlocked) {
        return res.json([]);
      }
      intervals.push({ startTime: override.startTime, endTime: override.endTime });
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
    }

    // Compute UTC bounds for the requested day in the schedule timezone so meeting queries
    // use the correct time range.
    const dayStart = zonedTimeToUtc(`${date} 00:00:00`, timezone);
    const dayEnd = zonedTimeToUtc(`${date} 23:59:59.999`, timezone);

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
