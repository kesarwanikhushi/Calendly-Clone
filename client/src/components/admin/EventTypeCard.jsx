import Card from "../ui/Card";
import Button from "../ui/Button";

export default function EventTypeCard({ eventType, onEdit, onDelete, onCopyLink }) {
  const bookingUrl = `${window.location.origin}/book/${eventType.slug}`;

  return (
    <Card hoverable className="p-0">
      <div className="flex items-center">
        <div className="w-1 bg-violet-500 rounded-l-md" />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-text-primary truncate">{eventType.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{eventType.duration} min · {eventType.location || "Google Meet"} · {eventType.type || "Group"}</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => onCopyLink(bookingUrl)}
                className="px-3 py-1 border border-border rounded-full text-sm text-text-primary hover:bg-surface"
              >
                Copy link
              </button>
              <a href={bookingUrl} target="_blank" rel="noreferrer" className="p-2 rounded hover:bg-surface">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><path d="M14 3h7v7" /><path d="M10 14L21 3" /><path d="M21 21H3V3" /></svg>
              </a>
              <button className="p-1.5 rounded-full hover:bg-surface">⋮</button>
            </div>
          </div>

          {eventType.questions && eventType.questions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-text-secondary">{eventType.questions.length} custom question{eventType.questions.length > 1 ? "s" : ""}</p>
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs text-text-secondary truncate">{bookingUrl}</div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(eventType)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(eventType)}>Delete</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
