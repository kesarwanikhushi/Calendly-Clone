import { format, parseISO } from "date-fns";

export function formatDateTime(dateStr) {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
}

export function formatDate(dateStr) {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(date, "MMMM d, yyyy");
}

export function formatTime(dateStr) {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(date, "h:mm a");
}

export function formatDateShort(dateStr) {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(date, "MMM d, yyyy");
}

export function formatForApi(date) {
  return format(date, "yyyy-MM-dd");
}
