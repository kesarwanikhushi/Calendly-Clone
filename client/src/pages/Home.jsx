import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchEventTypes, createEventType, updateEventType, deleteEventType } from "../api/eventTypes";
import { useAuth } from "../context/AuthContext";
import EventTypeCard from "../components/admin/EventTypeCard";
import EventTypeForm from "../components/admin/EventTypeForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Home() {
  const { user } = useAuth();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchEventTypes();
      setEventTypes(res.data);
    } catch {
      setError("Failed to load event types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(data) {
    try {
      setSubmitting(true);
      setError("");
      if (editing) {
        await updateEventType(editing.id, data);
      } else {
        await createEventType(data);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save event type";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(eventType) {
    if (!window.confirm(`Are you sure you want to delete "${eventType.name}"? This cannot be undone.`)) return;
    try {
      setError("");
      await deleteEventType(eventType.id);
      await load();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete event type";
      setError(msg);
    }
  }

  function handleEdit(eventType) {
    setEditing(eventType);
    setModalOpen(true);
  }

  function handleCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleCopyLink(url) {
    navigator.clipboard.writeText(url);
    setCopiedSlug(url);
    setTimeout(() => setCopiedSlug(""), 2000);
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Scheduling</h1>
            <p className="text-xs text-text-secondary mt-0.5">Scheduling made simple</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleCreate} id="create-event-type-btn">+ Create</Button>
          </div>
        </div>

        <div className="mt-5 border-b border-border">
          <nav className="flex gap-6 text-sm text-text-secondary pb-3">
            <button className="text-primary font-medium border-b-2 border-primary pb-3">Event types</button>
          </nav>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="w-1/2">
            <Input placeholder="Search event types" />
          </div>
          <div className="text-sm text-text-secondary">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-medium">{user.name?.[0] || "U"}</div>
                <div>{user.name || user.email}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-error/20 rounded-md text-sm text-error">
          {error}
        </div>
      )}

      {copiedSlug && (
        <div className="mb-4 p-3 bg-success-light border border-success/20 rounded-md text-sm text-success">
          Link copied to clipboard
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006BFF" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No event types yet</h3>
          <p className="text-sm text-text-secondary mb-4">Create your first event type to start scheduling</p>
          <Button onClick={handleCreate}>Create Event Type</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {eventTypes.map((et) => (
            <EventTypeCard
              key={et.id}
              eventType={et}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopyLink={handleCopyLink}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Edit Event Type" : "New Event Type"}
      >
        <EventTypeForm
          eventType={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
          isSubmitting={submitting}
        />
      </Modal>
    </div>
  );
}
