export default function Card({ children, className = "", hoverable = false }) {
  return (
    <div
      className={`bg-white rounded-lg border border-border shadow-sm ${
        hoverable ? "hover:shadow-md transition-shadow duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
