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
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-error/20 rounded-md text-sm text-error">{error}</div>
      )}

      <Card className="flex flex-col md:flex-row shadow-sm overflow-hidden min-h-[500px]">
        {/* Left Sidebar for Event Details */}
        <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-border p-6 md:p-8 shrink-0">
          <h2 className="text-2xl font-bold text-text-primary mb-4">{eventType.name}</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-text-secondary">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4.5V8l2.5 1.5" />
              </svg>
              <div className="text-sm">
                <span className="font-medium text-text-primary">{eventType.duration} min</span>
              </div>
            </div>

            {(eventType.bufferBefore > 0 || eventType.bufferAfter > 0) && (
              <div className="flex items-start gap-3 text-text-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm flex flex-col gap-1">
                  {eventType.bufferBefore > 0 && <span>{eventType.bufferBefore} min buffer before</span>}
                  {eventType.bufferAfter > 0 && <span>{eventType.bufferAfter} min buffer after</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calendar and Slots Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="flex-1 p-6 md:p-8">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Select a Date & Time</h3>
            <CalendarPicker
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
            />
          </div>

          {selectedDate && (
            <div className="w-full lg:w-80 bg-surface/30 border-t lg:border-t-0 lg:border-l border-border p-6 md:p-8 overflow-y-auto">
              {!showForm ? (
                <>
                  <p className="text-sm font-medium text-text-primary mb-4">
                    {formatDate(selectedDate)}
                  </p>
                  <SlotGrid
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelect={handleSlotSelect}
                    loading={slotsLoading}
                  />
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to times
                  </button>
                  <h3 className="text-base font-semibold text-text-primary mb-4">Your Details</h3>
                  <BookingForm
                    questions={eventType.questions || []}
                    onSubmit={handleBooking}
                    isSubmitting={submitting}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
