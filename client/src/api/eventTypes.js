import api from "./index";

export function fetchEventTypes() {
  return api.get("/api/event-types");
}

export function createEventType(data) {
  return api.post("/api/event-types", data);
}

export function updateEventType(id, data) {
  return api.put(`/api/event-types/${id}`, data);
}

export function deleteEventType(id) {
  return api.delete(`/api/event-types/${id}`);
}

export function fetchPublicEventType(slug) {
  return api.get(`/api/book/types/${slug}`);
}
