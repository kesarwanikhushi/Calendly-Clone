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
      <div className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-6 shadow-md">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-text-primary mb-6">Meeting Confirmed</h2>

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
