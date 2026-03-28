import api from "./index";

export function fetchSlots(slug, date) {
  return api.get(`/api/slots?slug=${slug}&date=${date}`);
}
