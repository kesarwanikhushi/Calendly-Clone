import { format, parseISO } from "date-fns";

export default function SlotGrid({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-6">
        No available time slots for this date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {slots.map((slot) => {
        const time = typeof slot === "string" ? parseISO(slot) : slot;
        const isSelected = selectedSlot === slot;
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={`px-3 py-2.5 text-sm font-medium rounded-md border transition-all duration-150 cursor-pointer ${
              isSelected
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-primary border-border hover:border-primary hover:bg-primary-light"
            }`}
          >
            {format(time, "h:mm a")}
          </button>
        );
      })}
    </div>
  );
}
