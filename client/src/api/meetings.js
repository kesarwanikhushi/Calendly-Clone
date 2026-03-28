import api from "./index";

export function fetchMeetings() {
  return api.get("/api/meetings");
}

export function fetchMeeting(id) {
  return api.get(`/api/meetings/${id}`);
}

export function cancelMeeting(id) {
  return api.patch(`/api/meetings/${id}`, { status: "cancelled" });
}

export function rescheduleMeeting(id, startTime, endTime) {
  return api.patch(`/api/meetings/${id}`, { startTime, endTime });
}

export function bookMeeting(data) {
  return api.post("/api/book", data);
}
