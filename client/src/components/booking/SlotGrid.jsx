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
      {slots.map((slotObj) => {
        // Handle both older string-based formats and the new object format backwards compatibly
        const isString = typeof slotObj === "string";
        const timeStr = isString ? slotObj : slotObj.time;
        const available = isString ? true : slotObj.available;
        
        const time = parseISO(timeStr);
        const isSelected = selectedSlot === timeStr;
        
        let buttonClass = "px-3 py-2.5 text-sm font-medium rounded-md border transition-all duration-150 ";
        if (!available) {
          buttonClass += "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60";
        } else if (isSelected) {
          buttonClass += "bg-primary text-white border-primary shadow-sm cursor-pointer";
        } else {
          buttonClass += "bg-white text-primary border-border hover:border-primary hover:bg-primary-light cursor-pointer";
        }

        return (
          <button
            key={timeStr}
            type="button"
            disabled={!available}
            onClick={() => available && onSelect(timeStr)}
            className={buttonClass}
          >
            {format(time, "h:mm a")}
          </button>
        );
      })}
    </div>
  );
}
