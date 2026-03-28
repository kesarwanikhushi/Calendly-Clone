import Calendar from "react-calendar";

export default function CalendarPicker({ value, onChange, tileDisabled, minDate }) {
  return (
    <div className="calendar-wrapper">
      <Calendar
        value={value}
        onChange={onChange}
        tileDisabled={tileDisabled}
        minDate={minDate || new Date()}
        locale="en-US"
        prev2Label={null}
        next2Label={null}
        minDetail="month"
      />
    </div>
  );
}
