export default function Input({
  label,
  id,
  error,
  className = "",
  type = "text",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3 py-2 border rounded-md text-sm text-text-primary placeholder-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          error ? "border-error" : "border-border"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
