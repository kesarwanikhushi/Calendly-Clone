const badgeStyles = {
  active: "bg-success-light text-success",
  cancelled: "bg-gray-100 text-cancelled",
  upcoming: "bg-primary-light text-primary",
};

export default function Badge({ status, className = "" }) {
  const displayText = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${badgeStyles[status] || badgeStyles.active} ${className}`}>
      {displayText}
    </span>
  );
}
