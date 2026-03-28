import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function EventTypeCard({ eventType, onEdit, onDelete, onCopyLink }) {
  const bookingUrl = `${window.location.origin}/book/${eventType.slug}`;

  return (
    <Card hoverable className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">{eventType.name}</h3>
          <p className="text-sm text-text-secondary mt-0.5">{eventType.duration} min</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          {eventType.bufferBefore > 0 && (
            <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded">
              {eventType.bufferBefore}m before
            </span>
          )}
          {eventType.bufferAfter > 0 && (
            <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded">
              {eventType.bufferAfter}m after
            </span>
          )}
        </div>
      </div>

      {eventType.questions && eventType.questions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-secondary">
            {eventType.questions.length} custom question{eventType.questions.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 p-2.5 bg-surface rounded-md mb-4">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5">
          <path d="M6 8h4M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM5 4V2M11 4V2" />
        </svg>
        <span className="text-xs text-text-secondary truncate flex-1">{bookingUrl}</span>
        <button
          onClick={() => onCopyLink(bookingUrl)}
          className="text-primary text-xs font-medium hover:text-primary-hover transition-colors shrink-0 cursor-pointer"
        >
          Copy
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(eventType)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(eventType)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
