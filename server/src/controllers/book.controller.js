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

module.exports = { book };
