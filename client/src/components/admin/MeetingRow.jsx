import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatDateTime } from "../../utils/formatDate";

export default function MeetingRow({ meeting, onCancel, onReschedule, showActions = true }) {
  const isUpcoming = new Date(meeting.startTime) > new Date() && meeting.status === "active";
  const displayStatus = isUpcoming ? "upcoming" : meeting.status;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white border border-border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-text-primary truncate">{meeting.inviteeName}</p>
          <Badge status={displayStatus} />
        </div>
        <p className="text-xs text-text-secondary">{meeting.inviteeEmail}</p>
        <p className="text-xs text-text-secondary mt-1">
          {meeting.eventType?.name} - {formatDateTime(meeting.startTime)}
        </p>
      </div>
      {showActions && isUpcoming && (
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => onReschedule(meeting)}>
            Reschedule
          </Button>
          <Button variant="danger" size="sm" onClick={() => onCancel(meeting)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
