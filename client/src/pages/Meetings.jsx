import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMeetings, cancelMeeting } from "../api/meetings";
import MeetingRow from "../components/admin/MeetingRow";
import Tabs from "../components/ui/Tabs";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchMeetings();
      setMeetings(res.data);
    } catch {
      setError("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const upcoming = meetings.filter((m) => new Date(m.startTime) > now && m.status === "active");
  const past = meetings.filter((m) => new Date(m.startTime) <= now || m.status === "cancelled");

  async function handleCancel(meeting) {
    if (!window.confirm(`Cancel the meeting with ${meeting.inviteeName}?`)) return;
    try {
      setError("");
      await cancelMeeting(meeting.id);
      await load();
    } catch {
      setError("Failed to cancel meeting");
    }
  }

  function handleReschedule(meeting) {
    navigate(`/meetings/${meeting.id}/reschedule`);
  }

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past", count: past.length },
  ];

  const displayed = activeTab === "upcoming" ? upcoming : past;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Meetings</h1>
        <p className="text-sm text-text-secondary mt-1">View and manage all your scheduled meetings</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-error/20 rounded-md text-sm text-error">{error}</div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-text-secondary">
              {activeTab === "upcoming" ? "No upcoming meetings" : "No past meetings"}
            </p>
          </div>
        ) : (
          displayed.map((m) => (
            <MeetingRow
              key={m.id}
              meeting={m}
              onCancel={handleCancel}
              onReschedule={handleReschedule}
              showActions={activeTab === "upcoming"}
            />
          ))
        )}
      </div>
    </div>
  );
}
