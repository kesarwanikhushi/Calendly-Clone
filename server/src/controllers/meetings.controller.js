const prisma = require("../lib/prisma");
const { addMinutes, subMinutes } = require("date-fns");
const { sendCancellationNotification, sendRescheduleConfirmation } = require("../lib/mailer");

async function list(req, res, next) {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { eventType: { userId: req.user.id } },
      include: {
        eventType: true,
        answers: true,
      },
      orderBy: { startTime: "desc" },
    });
    res.json(meetings);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        eventType: true,
        answers: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (meeting.eventType.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(meeting);
  } catch (err) {
    next(err);
  }
}

async function patch(req, res, next) {
  try {
    const { id } = req.params;
    const { status, startTime, endTime } = req.body;

    const meeting = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: { eventType: { include: { user: true } } },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (meeting.eventType.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (status === "cancelled") {
      const updated = await prisma.meeting.update({
        where: { id: Number(id) },
        data: { status: "cancelled" },
        include: { eventType: { include: { user: true } }, answers: true },
      });

      try {
        await sendCancellationNotification(updated, updated.eventType);
      } catch (mailError) {
        console.error("Failed to send cancellation notification:", mailError);
      }
      return res.json(updated);
    }

    if (startTime && endTime) {
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);
      const blockedStart = subMinutes(newStart, meeting.eventType.bufferBefore);
      const blockedEnd = addMinutes(newEnd, meeting.eventType.bufferAfter);

      const conflict = await prisma.meeting.findFirst({
        where: {
          eventTypeId: meeting.eventTypeId,
          status: "active",
          id: { not: Number(id) },
          startTime: { lt: blockedEnd },
          endTime: { gt: blockedStart },
        },
      });

      if (conflict) {
        return res.status(409).json({ error: "This time slot is no longer available" });
      }

      const updated = await prisma.meeting.update({
        where: { id: Number(id) },
        data: { startTime: newStart, endTime: newEnd },
        include: { eventType: { include: { user: true } }, answers: true },
      });

      try {
        await sendRescheduleConfirmation(updated, updated.eventType);
      } catch (mailError) {
        console.error("Failed to send reschedule confirmation:", mailError);
      }
      return res.json(updated);
    }

    res.status(400).json({ error: "Invalid update request" });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, patch };
