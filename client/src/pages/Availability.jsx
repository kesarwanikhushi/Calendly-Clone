import { useState, useEffect, useCallback } from "react";
import {
  fetchAvailability,
  saveAvailability,
  fetchOverrides,
  createOverride,
  deleteOverride,
} from "../api/availability";
import { getBrowserTimezone, getTimezoneList } from "../utils/timezone";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Card from "../components/ui/Card";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function defaultDayState() {
  return DAY_NAMES.map((_, i) => ({
    dayOfWeek: i,
    enabled: false,
    startTime: "09:00",
    endTime: "17:00",
  }));
}

export default function Availability() {
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

  const load = useCallback(async () => {
    try {
      const [availRes, overrideRes] = await Promise.all([fetchAvailability(), fetchOverrides()]);
      const records = availRes.data;
      const overrideRecords = overrideRes.data;

      if (records.length > 0) {
        setTimezone(records[0].timezone || getBrowserTimezone());
        const updated = defaultDayState();
        records.forEach((r) => {
          updated[r.dayOfWeek] = {
            ...updated[r.dayOfWeek],
            enabled: true,
            startTime: r.startTime,
            endTime: r.endTime,
          };
        });
        setDays(updated);
      }

      setOverrides(overrideRecords);
    } catch {
      setError("Failed to load availability");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateDay(index, field, value) {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDays(updated);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const enabledDays = days
        .filter((d) => d.enabled)
        .map((d) => ({ dayOfWeek: d.dayOfWeek, startTime: d.startTime, endTime: d.endTime }));
      await saveAvailability({ timezone, days: enabledDays });
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
    if (!overrideDate) return;
    try {
      setSavingOverride(true);
      setError("");
      await createOverride({
        date: overrideDate,
        startTime: overrideBlocked ? null : overrideStart,
        endTime: overrideBlocked ? null : overrideEnd,
        isBlocked: overrideBlocked,
      });
      setOverrideDate("");
      setOverrideBlocked(false);
      setOverrideStart("09:00");
      setOverrideEnd("17:00");
      await load();
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
      await load();
    } catch {
      setError("Failed to delete override");
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
            <div key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-surface transition-colors">
              <label className="flex items-center gap-2 w-28 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(e) => updateDay(i, "enabled", e.target.checked)}
                  className="accent-primary cursor-pointer"
                />
                <span className={`text-sm font-medium ${day.enabled ? "text-text-primary" : "text-text-secondary"}`}>
                  {DAY_NAMES[i]}
                </span>
              </label>
              {day.enabled && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(i, "startTime", e.target.value)}
                    className="px-2 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-text-secondary text-sm">to</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(i, "endTime", e.target.value)}
                    className="px-2 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
              {!day.enabled && (
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
    </div>
  );
}
