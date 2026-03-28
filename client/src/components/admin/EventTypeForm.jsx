import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

const BUFFER_OPTIONS = [
  { value: "0", label: "No buffer" },
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function EventTypeForm({ eventType, onSubmit, onCancel, isSubmitting }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [bufferBefore, setBufferBefore] = useState("0");
  const [bufferAfter, setBufferAfter] = useState("0");
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (eventType) {
      setName(eventType.name);
      setDuration(String(eventType.duration));
      setSlug(eventType.slug);
      setSlugEdited(true);
      setBufferBefore(String(eventType.bufferBefore));
      setBufferAfter(String(eventType.bufferAfter));
      setQuestions(
        eventType.questions
          ? eventType.questions.map((q) => ({ label: q.label, required: q.required, order: q.order }))
          : []
      );
    }
  }, [eventType]);

  function handleNameChange(e) {
    const val = e.target.value;
    setName(val);
    if (!slugEdited) {
      setSlug(generateSlug(val));
    }
  }

  function handleSlugChange(e) {
    setSlug(e.target.value);
    setSlugEdited(true);
  }

  function addQuestion() {
    setQuestions([...questions, { label: "", required: false, order: questions.length + 1 }]);
  }

  function removeQuestion(index) {
    const updated = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 }));
    setQuestions(updated);
  }

  function updateQuestion(index, field, value) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!slug.trim()) errs.slug = "Slug is required";
    if (!/^[a-z0-9-]+$/.test(slug)) errs.slug = "Slug must be lowercase letters, numbers, and hyphens";
    questions.forEach((q, i) => {
      if (!q.label.trim()) errs[`question_${i}`] = "Question label is required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      duration: Number(duration),
      slug: slug.trim(),
      bufferBefore: Number(bufferBefore),
      bufferAfter: Number(bufferAfter),
      questions: questions.map((q, i) => ({ label: q.label.trim(), required: q.required, order: i + 1 })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Event Name"
        id="event-name"
        value={name}
        onChange={handleNameChange}
        error={errors.name}
        placeholder="e.g. Quick Chat"
      />

      <Select
        label="Duration"
        id="event-duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        options={DURATION_OPTIONS}
      />

      <Input
        label="Slug"
        id="event-slug"
        value={slug}
        onChange={handleSlugChange}
        error={errors.slug}
        placeholder="e.g. quick-chat"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Buffer Before"
          id="buffer-before"
          value={bufferBefore}
          onChange={(e) => setBufferBefore(e.target.value)}
          options={BUFFER_OPTIONS}
        />
        <Select
          label="Buffer After"
          id="buffer-after"
          value={bufferAfter}
          onChange={(e) => setBufferAfter(e.target.value)}
          options={BUFFER_OPTIONS}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-primary">Custom Questions</label>
          <Button type="button" variant="ghost" size="sm" onClick={addQuestion}>
            + Add Question
          </Button>
        </div>
        {questions.length === 0 && (
          <p className="text-xs text-text-secondary italic">No custom questions added</p>
        )}
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-surface rounded-md">
              <div className="flex-1">
                <Input
                  id={`question-${i}`}
                  value={q.label}
                  onChange={(e) => updateQuestion(i, "label", e.target.value)}
                  error={errors[`question_${i}`]}
                  placeholder="Question label"
                />
              </div>
              <label className="flex items-center gap-1.5 pt-1.5 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(i, "required", e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
                <span className="text-xs text-text-secondary">Required</span>
              </label>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="p-1 text-text-secondary hover:text-error transition-colors mt-1 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : eventType ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
