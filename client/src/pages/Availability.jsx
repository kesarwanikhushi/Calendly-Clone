// client/src/pages/Availability.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { getBrowserTimezone, getTimezoneList } from "../utils/timezone";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";

// --- API Functions ---
const fetchSchedules = () => api.get("/api/schedules");
const createSchedule = (data) => api.post("/api/schedules", data);

const fetchAvailability = (scheduleId) => api.get(`/api/availability?scheduleId=${scheduleId}`);
const saveAvailability = (data) => api.post("/api/availability", data);

const fetchOverrides = (scheduleId) => api.get(`/api/overrides?scheduleId=${scheduleId}`);
const createOverride = (data) => api.post("/api/overrides", data);
const deleteOverride = (id) => api.delete(`/api/overrides/${id}`);

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function defaultDayState() {
  return DAY_NAMES.map((_, i) => ({
    dayOfWeek: i,
    enabled: false,
    intervals: [{ startTime: "09:00", endTime: "17:00" }],
  }));
}

export default function Availability() {
  const [schedules, setSchedules] = useState([]);
  const [activeScheduleId, setActiveScheduleId] = useState("");
  
  const [timezone, setTimezone] = useState(getBrowserTimezone());
  const [days, setDays] = useState(defaultDayState());
  const [overrides, setOverrides] = useState([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [overrideDate, setOverrideDate] = useState("");
  const [overrideBlocked, setOverrideBlocked] = useState(false);
  const [overrideStart, setOverrideStart] = useState("09:00");
  const [overrideEnd, setOverrideEnd] = useState("17:00");
  const [savingOverride, setSavingOverride] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");

  const loadSchedules = useCallback(async () => {
    try {
      const res = await fetchSchedules();
      setSchedules(res.data);
      if (res.data.length > 0 && !activeScheduleId) {
        // Set first schedule if none is selected
        setActiveScheduleId(res.data[0].id.toString());
      }
    } catch {
      setError("Failed to load schedules");
    }
  }, [activeScheduleId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const loadAvailability = useCallback(async () => {
    if (!activeScheduleId) return;
    try {
      const [availRes, overrideRes] = await Promise.all([
        fetchAvailability(activeScheduleId), 
        fetchOverrides(activeScheduleId)
      ]);
      const records = availRes.data;
      const overrideRecords = overrideRes.data;

      const currentSchedule = schedules.find(s => s.id.toString() === activeScheduleId);
      setTimezone(currentSchedule?.timezone || getBrowserTimezone());

      const updated = defaultDayState();
      // Track which days have had their default intervals cleared
      const clearedDays = new Set();

      records.forEach((r) => {
        if (!clearedDays.has(r.dayOfWeek)) {
          updated[r.dayOfWeek].enabled = true;
          updated[r.dayOfWeek].intervals = [];
          clearedDays.add(r.dayOfWeek);
        }
        updated[r.dayOfWeek].intervals.push({ startTime: r.startTime, endTime: r.endTime });
      });
      setDays(updated);
      setOverrides(overrideRecords);
    } catch {
      setError("Failed to load availability for schedule");
    }
  }, [activeScheduleId, schedules]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  function updateDayEnabled(index, enabled) {
    const updated = [...days];
    updated[index] = { ...updated[index], enabled };
    setDays(updated);
  }

  function updateInterval(dayIndex, intervalIndex, field, value) {
    const updated = [...days];
    updated[dayIndex].intervals[intervalIndex][field] = value;
    setDays(updated);
  }

  function addInterval(dayIndex) {
    const updated = [...days];
    updated[dayIndex].intervals.push({ startTime: "09:00", endTime: "17:00" });
    setDays(updated);
  }

  function removeInterval(dayIndex, intervalIndex) {
    const updated = [...days];
    updated[dayIndex].intervals.splice(intervalIndex, 1);
    if (updated[dayIndex].intervals.length === 0) {
      updated[dayIndex].enabled = false;
      updated[dayIndex].intervals.push({ startTime: "09:00", endTime: "17:00" });
    }
    setDays(updated);
  }

  async function handleSave() {
    if (!activeScheduleId) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      const enabledDays = [];
      days.filter((d) => d.enabled).forEach((d) => {
        d.intervals.forEach((interval) => {
          enabledDays.push({ 
            dayOfWeek: d.dayOfWeek, 
            startTime: interval.startTime, 
            endTime: interval.endTime 
          });
        });
      });
      
      await saveAvailability({ scheduleId: activeScheduleId, timezone, days: enabledDays });
      
      setSuccess("Availability saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save availability");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddOverride(e) {
    e.preventDefault();
    if (!overrideDate || !activeScheduleId) return;
    try {
      setSavingOverride(true);
      setError("");
      await createOverride({
        scheduleId: activeScheduleId,
        date: overrideDate,
        startTime: overrideBlocked ? null : overrideStart,
        endTime: overrideBlocked ? null : overrideEnd,
        isBlocked: overrideBlocked,
      });
      setOverrideDate("");
      setOverrideBlocked(false);
      setOverrideStart("09:00");
      setOverrideEnd("17:00");
      await loadAvailability();
    } catch {
      setError("Failed to add override");
    } finally {
      setSavingOverride(false);
    }
  }

  async function handleDeleteOverride(id) {
    try {
      setError("");
      await deleteOverride(id);
      await loadAvailability();
    } catch {
      setError("Failed to delete override");
    }
  }

  async function handleCreateSchedule(e) {
    e.preventDefault();
    if (!newScheduleName.trim()) return;
    try {
      const res = await createSchedule({ name: newScheduleName, timezone: getBrowserTimezone() });
      setNewScheduleName("");
      setIsModalOpen(false);
      await loadSchedules();
      setActiveScheduleId(res.data.id.toString());
    } catch {
      setError("Failed to create schedule");
    }
  }

  const timezoneOptions = getTimezoneList().map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Availability</h1>
        <p className="text-sm text-text-secondary mt-1">Set your weekly schedule and date-specific overrides</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-error/20 rounded-md text-sm text-error">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-success-light border border-success/20 rounded-md text-sm text-success">{success}</div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <Select
            label="Active Schedule"
            id="schedule-select"
            value={activeScheduleId}
            onChange={(e) => setActiveScheduleId(e.target.value)}
            options={schedules.map(s => ({ value: s.id.toString(), label: s.name }))}
          />
        </div>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            + Create Schedule
          </Button>
        </div>
      </div>

      {activeScheduleId && (
        <>
          <Card className="p-5 mb-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">Weekly Schedule</h2>

            <Select
              label="Timezone"
              id="timezone-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={timezoneOptions}
              className="mb-5 max-w-sm"
            />

            <div className="space-y-3">
              {days.map((day, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-md hover:bg-surface transition-colors">
                  <label className="flex items-center gap-2 w-28 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={(e) => updateDayEnabled(i, e.target.checked)}
                      className="accent-primary cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${day.enabled ? "text-text-primary" : "text-text-secondary"}`}>
                      {DAY_NAMES[i]}
                    </span>
                  </label>
                  
                  {day.enabled ? (
                    <div className="flex-1 flex flex-col gap-2">
                      {day.intervals.map((interval, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={interval.startTime}
                            onChange={(e) => updateInterval(i, j, "startTime", e.target.value)}
                            className="px-2 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <span className="text-text-secondary text-sm">to</span>
                          <input
                            type="time"
                            value={interval.endTime}
                            onChange={(e) => updateInterval(i, j, "endTime", e.target.value)}
                            className="px-2 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button
                            title="Remove interval"
                            onClick={() => removeInterval(i, j)}
                            className="text-text-secondary hover:text-error ml-2"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <div>
                        <button
                          onClick={() => addInterval(i)}
                          className="text-sm text-primary hover:text-primary-dark mt-1"
                        >
                          + Add interval
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-text-secondary italic">Unavailable</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-text-primary mb-4">Date-Specific Overrides</h2>

            <form onSubmit={handleAddOverride} className="flex flex-wrap items-end gap-3 mb-5 pb-5 border-b border-border">
              <Input
                label="Date"
                id="override-date"
                type="date"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-44"
              />
              <label className="flex items-center gap-2 pb-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideBlocked}
                  onChange={(e) => setOverrideBlocked(e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
                <span className="text-sm text-text-primary">Block entire day</span>
              </label>
              {!overrideBlocked && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Start</label>
                    <input
                      type="time"
                      value={overrideStart}
                      onChange={(e) => setOverrideStart(e.target.value)}
                      className="px-2 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">End</label>
                    <input
                      type="time"
                      value={overrideEnd}
                      onChange={(e) => setOverrideEnd(e.target.value)}
                      className="px-2 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </>
              )}
              <Button type="submit" disabled={savingOverride || !overrideDate}>
                {savingOverride ? "Adding..." : "Add Override"}
              </Button>
            </form>

            {overrides.length === 0 ? (
              <p className="text-sm text-text-secondary italic">No date-specific overrides</p>
            ) : (
              <div className="space-y-2">
                {overrides.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-surface rounded-md">
                    <div>
                      <span className="text-sm font-medium text-text-primary">{o.date}</span>
                      <span className="ml-3 text-sm text-text-secondary">
                        {o.isBlocked ? "Blocked" : `${o.startTime} - ${o.endTime}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteOverride(o.id)}
                      className="text-text-secondary hover:text-error text-sm transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Schedule"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <Input
            label="Schedule Name"
            value={newScheduleName}
            onChange={(e) => setNewScheduleName(e.target.value)}
            placeholder="e.g. Working Hours"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newScheduleName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}