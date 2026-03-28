export default function Select({
  label,
  id,
  options = [],
  error,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-2 border rounded-md text-sm text-text-primary bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer ${
          error ? "border-error" : "border-border"
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
