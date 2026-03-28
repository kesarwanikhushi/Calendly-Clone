const { addMinutes, parseISO, setHours, setMinutes, subMinutes } = require("date-fns");
const { zonedTimeToUtc } = require("date-fns-tz");

function computeFreeSlots(startTime, endTime, duration, bufferBefore, bufferAfter, bookedMeetings, date, timezone) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const base = parseISO(date);
  const localStart = setMinutes(setHours(base, startH), startM);
  const localEnd = setMinutes(setHours(base, endH), endM);

  const utcStart = zonedTimeToUtc(localStart, timezone);
  const utcEnd = zonedTimeToUtc(localEnd, timezone);

  const slots = [];
  let cursor = utcStart;

  while (addMinutes(cursor, duration) <= utcEnd) {
    const slotEnd = addMinutes(cursor, duration);
    const overlaps = bookedMeetings.some((m) => {
      const blockedStart = subMinutes(new Date(m.startTime), bufferBefore);
      const blockedEnd = addMinutes(new Date(m.endTime), bufferAfter);
      return cursor < blockedEnd && slotEnd > blockedStart;
    });
    if (!overlaps) {
      slots.push(cursor.toISOString());
    }
    cursor = addMinutes(cursor, duration);
  }

  return slots;
}

module.exports = { computeFreeSlots };
