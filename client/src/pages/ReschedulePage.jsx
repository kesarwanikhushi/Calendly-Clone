import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMeeting, rescheduleMeeting } from "../api/meetings";
import { fetchSlots } from "../api/slots";
import { addMinutes } from "date-fns";
import CalendarPicker from "../components/booking/CalendarPicker";
import SlotGrid from "../components/booking/SlotGrid";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { formatForApi, formatDate, formatDateTime } from "../utils/formatDate";

export default function ReschedulePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchMeeting(id);
        setMeeting(res.data);
        setSelectedDate(new Date(res.data.startTime));
      } catch {
        setError("Failed to load meeting details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!selectedDate || !meeting) return;
    async function loadSlots() {
      try {
        setSlotsLoading(true);
        setSelectedSlot(null);
        const dateStr = formatForApi(selectedDate);
        const res = await fetchSlots(meeting.eventType.slug, dateStr);
        setSlots(res.data);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [selectedDate, meeting]);

  async function handleReschedule() {
    if (!selectedSlot) return;
    try {
      setSubmitting(true);
      setError("");
      const startTime = new Date(selectedSlot);
      const endTime = addMinutes(startTime, meeting.eventType.duration);
      await rescheduleMeeting(id, startTime.toISOString(), endTime.toISOString());
      navigate("/meetings", { state: { message: "Meeting rescheduled successfully" } });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reschedule meeting");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-error">{error}</p>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-2">Reschedule Meeting</h2>
        <div className="bg-surface rounded-md p-3">
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{meeting.eventType.name}</span>
            {" with "}
            <span className="font-medium text-text-primary">{meeting.inviteeName}</span>
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Current time: {formatDateTime(meeting.startTime)}
          </p>
        </div>
      </Card>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-error/20 rounded-md text-sm text-error">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Select a New Date</h3>
          <CalendarPicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
          />
        </Card>

        <div>
          {selectedDate && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-1">Available Times</h3>
              <p className="text-xs text-text-secondary mb-4">{formatDate(selectedDate)}</p>
              <SlotGrid
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
                loading={slotsLoading}
              />
              {selectedSlot && (
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Button onClick={handleReschedule} disabled={submitting} className="flex-1">
                    {submitting ? "Rescheduling..." : "Confirm New Time"}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/meetings")}>
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
