import api from "./index";

export function fetchAvailability() {
  return api.get("/api/availability");
}

export function saveAvailability(data) {
  return api.post("/api/availability", data);
}

export function fetchOverrides() {
  return api.get("/api/overrides");
}

export function createOverride(data) {
  return api.post("/api/overrides", data);
}

export function deleteOverride(id) {
  return api.delete(`/api/overrides/${id}`);
}
