const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const eventType = await prisma.eventType.findFirst({ include: { questions: true } });
  if (!eventType) {
    console.log("No event type found");
    return;
  }
  
  let answers = [];
  if (eventType.questions.length > 0) {
    const q = eventType.questions[0];
    answers.push({ questionId: q.id, value: "Test Answer" });
  } else {
    // create a question
    const q = await prisma.question.create({
      data: { eventTypeId: eventType.id, label: "Any questions?", order: 1 }
    });
    answers.push({ questionId: q.id, value: "Test Answer" });
  }
  
  const payload = {
    slug: eventType.slug,
    inviteeName: "Test Name",
    inviteeEmail: "test@example.com",
    startTime: new Date(Date.now() + 86400000).toISOString(),
    answers: answers
  };
  
  console.log("Sending payload", JSON.stringify(payload, null, 2));

  const res = await fetch('http://localhost:5001/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Response Status:", res.status);
  console.log("Response Body:", text);
}
main().finally(() => prisma.$disconnect());
