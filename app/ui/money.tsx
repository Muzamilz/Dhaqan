export function Money({
  value,
  showSign = false,
  className,
}: {
  value: string;
  showSign?: boolean;
  className?: string;
}) {
  const negative = value.startsWith("-");
  const digits = negative ? value.slice(1) : value;
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      {negative ? "−" : showSign ? "+" : null}
      {digits}
    </span>
  );
}
