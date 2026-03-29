const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const meetings = await prisma.meeting.findMany({ include: { answers: true } });
  console.log("Total meetings:", meetings.length);
  console.log(JSON.stringify(meetings, null, 2));
}
main().finally(() => prisma.$disconnect());
