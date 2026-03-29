const prisma = require("../lib/prisma");
const { addMinutes, subMinutes } = require("date-fns");
const { sendBookingConfirmation } = require("../lib/mailer");

async function book(req, res, next) {
  try {
    const { slug, inviteeName, inviteeEmail, startTime, answers } = req.body;

    if (!slug || !inviteeName || !inviteeEmail || !startTime) {
      return res.status(400).json({ error: "slug, inviteeName, inviteeEmail, and startTime are required" });
    }

    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    const requiredQuestions = eventType.questions.filter((q) => q.required);
    for (const rq of requiredQuestions) {
      const answer = answers && answers.find((a) => a.questionId === rq.id);
      if (!answer || !answer.value || answer.value.trim() === "") {
        return res.status(400).json({ error: `Answer required for: ${rq.label}` });
      }
    }

    const meetingStart = new Date(startTime);
    const meetingEnd = addMinutes(meetingStart, eventType.duration);
    const blockedStart = subMinutes(meetingStart, eventType.bufferBefore);
    const blockedEnd = addMinutes(meetingEnd, eventType.bufferAfter);

    const conflict = await prisma.meeting.findFirst({
      where: {
        eventTypeId: eventType.id,
        status: "active",
        startTime: { lt: blockedEnd },
        endTime: { gt: blockedStart },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: "This time slot is no longer available" });
    }

    const meeting = await prisma.meeting.create({
      data: {
        eventTypeId: eventType.id,
        inviteeName,
        inviteeEmail,
        startTime: meetingStart,
        endTime: meetingEnd,
        answers: answers && answers.length > 0
          ? { create: answers.map((a) => ({ questionId: a.questionId, value: a.value })) }
          : undefined,
      },
      include: {
        eventType: true,
        answers: true,
      },
    });

    await sendBookingConfirmation(meeting, eventType);

    res.status(201).json(meeting);
  } catch (err) {
    next(err);
  }
}

async function getEventBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    res.json(eventType);
  } catch (err) {
    next(err);
  }
}

async function getMeetingById(req, res, next) {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: {
        eventType: true,
        answers: true,
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json(meeting);
  } catch (err) {
    next(err);
  }
}

async function rescheduleMeeting(req, res, next) {
  try {
    const { id } = req.params;
    const { startTime } = req.body;

    if (!startTime) {
      return res.status(400).json({ error: "startTime is required for rescheduling" });
    }

    const existingMeeting = await prisma.meeting.findUnique({
      where: { id: Number(id) },
      include: { eventType: true }
    });

    if (!existingMeeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (existingMeeting.status !== "active") {
      return res.status(400).json({ error: "Only active meetings can be rescheduled" });
    }

    const eventType = existingMeeting.eventType;
    const meetingStart = new Date(startTime);
    const meetingEnd = addMinutes(meetingStart, eventType.duration);
    const blockedStart = subMinutes(meetingStart, eventType.bufferBefore);
    const blockedEnd = addMinutes(meetingEnd, eventType.bufferAfter);

    const conflict = await prisma.meeting.findFirst({
      where: {
        eventTypeId: eventType.id,
        status: "active",
        id: { not: Number(id) },
        startTime: { lt: blockedEnd },
        endTime: { gt: blockedStart },
      },
    });

    if (conflict) {
      return res.status(409).json({ error: "This time slot is not available" });
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id: Number(id) },
      data: {
        startTime: meetingStart,
        endTime: meetingEnd,
      },
      include: {
        eventType: true,
        answers: true,
      },
    });

    await sendBookingConfirmation(updatedMeeting, eventType);

    res.json(updatedMeeting);
  } catch (err) {
    next(err);
  }
}

async function getUserPublicEventTypes(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { name: true, id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        duration: true,
        slug: true
      }
    });

    res.json({ user, eventTypes });
  } catch (err) {
    next(err);
  }
}

module.exports = { book, getEventBySlug, getMeetingById, rescheduleMeeting, getUserPublicEventTypes };
