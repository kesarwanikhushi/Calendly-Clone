import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPublicMeeting } from "../api/meetings";
import Card from "../components/ui/Card";
import { formatDateTime } from "../utils/formatDate";

export default function ConfirmedPage() {
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!meetingId) {
      setError("No meeting ID provided");
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const res = await fetchPublicMeeting(meetingId);
        setMeeting(res.data);
      } catch {
        setError("Failed to load meeting details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-error">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-text-primary mb-2">Meeting Confirmed</h2>
      <p className="text-sm text-text-secondary mb-6">
        A confirmation email has been sent to your inbox.
      </p>

      <div className="bg-surface rounded-lg p-5 text-left space-y-3">
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide">Event</p>
          <p className="text-sm font-medium text-text-primary">{meeting.eventType?.name}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide">When</p>
          <p className="text-sm font-medium text-text-primary">
            {formatDateTime(meeting.startTime)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide">Duration</p>
          <p className="text-sm font-medium text-text-primary">{meeting.eventType?.duration} minutes</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wide">Invitee</p>
          <p className="text-sm font-medium text-text-primary">{meeting.inviteeName}</p>
          <p className="text-xs text-text-secondary">{meeting.inviteeEmail}</p>
        </div>
      </div>
    </Card>
  );
}
