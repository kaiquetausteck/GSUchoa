export function TypewriterLine({
  value,
  className,
  showCursor,
}: {
  value: string;
  className?: string;
  showCursor?: boolean;
}) {
  return (
    <span className={`block ${className ?? ""}`}>
      {value}
      {showCursor ? <span aria-hidden="true" className="type-cursor" /> : null}
    </span>
  );
}

export function TypewriterParagraph({
  value,
  className,
  showCursor,
}: {
  value: string;
  className?: string;
  showCursor?: boolean;
}) {
  return (
    <p className={className}>
      {value}
      {showCursor ? <span aria-hidden="true" className="type-cursor" /> : null}
    </p>
  );
}
