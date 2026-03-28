const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary/30",
  secondary: "bg-white text-text-primary border border-border hover:bg-surface focus:ring-primary/20",
  danger: "bg-error text-white hover:bg-red-600 focus:ring-error/30",
  ghost: "text-text-secondary hover:bg-surface hover:text-text-primary",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
