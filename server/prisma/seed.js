const { PrismaClient } = require("@prisma/client");
const { addDays, addHours, subDays } = require("date-fns");

const prisma = new PrismaClient();

async function main() {
  await prisma.answer.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.question.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.availabilityOverride.deleteMany();

  const quickChat = await prisma.eventType.create({
    data: {
      name: "Quick Chat",
      duration: 15,
      slug: "quick-chat",
      bufferBefore: 0,
      bufferAfter: 0,
    },
  });

  const techInterview = await prisma.eventType.create({
    data: {
      name: "Technical Interview",
      duration: 60,
      slug: "technical-interview",
      bufferBefore: 10,
      bufferAfter: 5,
      questions: {
        create: [
          { label: "What role are you applying for?", required: true, order: 1 },
          { label: "Link to your portfolio or GitHub", required: false, order: 2 },
        ],
      },
    },
  });

  const days = [1, 2, 3, 4, 5];
  for (const day of days) {
    await prisma.availability.create({
      data: {
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "America/New_York",
      },
    });
  }

  const now = new Date();

  await prisma.meeting.create({
    data: {
      eventTypeId: quickChat.id,
      inviteeName: "Alice Johnson",
      inviteeEmail: "alice@example.com",
      startTime: addDays(now, 3),
      endTime: addHours(addDays(now, 3), 0.25),
      status: "active",
    },
  });

  await prisma.meeting.create({
    data: {
      eventTypeId: techInterview.id,
      inviteeName: "Bob Smith",
      inviteeEmail: "bob@example.com",
      startTime: addDays(now, 5),
      endTime: addHours(addDays(now, 5), 1),
      status: "active",
      answers: {
        create: [
          { questionId: (await prisma.question.findFirst({ where: { eventTypeId: techInterview.id, order: 1 } })).id, value: "Senior Frontend Engineer" },
          { questionId: (await prisma.question.findFirst({ where: { eventTypeId: techInterview.id, order: 2 } })).id, value: "https://github.com/bobsmith" },
        ],
      },
    },
  });

  await prisma.meeting.create({
    data: {
      eventTypeId: quickChat.id,
      inviteeName: "Carol Davis",
      inviteeEmail: "carol@example.com",
      startTime: subDays(now, 7),
      endTime: addHours(subDays(now, 7), 0.25),
      status: "active",
    },
  });

  await prisma.meeting.create({
    data: {
      eventTypeId: quickChat.id,
      inviteeName: "Dan Wilson",
      inviteeEmail: "dan@example.com",
      startTime: subDays(now, 3),
      endTime: addHours(subDays(now, 3), 0.25),
      status: "cancelled",
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(e.message + "\n");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
