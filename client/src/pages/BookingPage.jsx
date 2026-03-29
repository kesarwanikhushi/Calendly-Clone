import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPublicEventType } from "../api/eventTypes";
import { fetchSlots } from "../api/slots";
import { bookMeeting } from "../api/meetings";
import CalendarPicker from "../components/booking/CalendarPicker";
import SlotGrid from "../components/booking/SlotGrid";
import BookingForm from "../components/booking/BookingForm";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { formatForApi, formatDate } from "../utils/formatDate";

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchPublicEventType(slug);
        setEventType(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError("Failed to load event details");
        }
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !slug) return;
    async function loadSlots() {
      try {
        setSlotsLoading(true);
        setSelectedSlot(null);
        setShowForm(false);
        const dateStr = formatForApi(selectedDate);
        const res = await fetchSlots(slug, dateStr);
        setSlots(res.data);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [selectedDate, slug]);

  function handleSlotSelect(slot) {
    setSelectedSlot(slot);
    setShowForm(true);
  }

  async function handleBooking({ inviteeName, inviteeEmail, answers }) {
    try {
      setSubmitting(true);
      setError("");
      const res = await bookMeeting({
        slug,
        inviteeName,
        inviteeEmail,
        startTime: selectedSlot,
        answers,
      });
      navigate(`/book/${slug}/confirmed?meetingId=${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to book meeting");
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

  if (error && !eventType) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-error mb-2">Error</h2>
        <p className="text-sm text-text-secondary">{error}</p>
      </Card>
    );
  }

  if (notFound || !eventType) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Event Not Found</h2>
        <p className="text-sm text-text-secondary">
          The scheduling link you followed is invalid or has been removed.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-xl font-bold text-text-primary">{eventType.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm text-text-secondary flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4.5V8l2.5 1.5" />
              </svg>
              {eventType.duration} min
            </span>
            {eventType.bufferBefore > 0 && (
              <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded">
                {eventType.bufferBefore}m buffer before
              </span>
            )}
            {eventType.bufferAfter > 0 && (
              <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded">
                {eventType.bufferAfter}m buffer after
              </span>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-error/20 rounded-md text-sm text-error">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Select a Date</h3>
          <CalendarPicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
          />
        </Card>

        <div>
          {selectedDate && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Available Times
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                {formatDate(selectedDate)}
              </p>
              <SlotGrid
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={handleSlotSelect}
                loading={slotsLoading}
              />
            </Card>
          )}

          {showForm && selectedSlot && (
            <Card className="p-5 mt-4">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Your Details</h3>
              <BookingForm
                questions={eventType.questions || []}
                onSubmit={handleBooking}
                isSubmitting={submitting}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
