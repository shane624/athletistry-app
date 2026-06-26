// Animated three-dot loading indicator — the same pulse used on the login/join
// buttons. Inherits the current text color, so it works on light or dark buttons.
export default function Dots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Loading">
      <span className="dot-pulse" />
      <span className="dot-pulse" style={{ animationDelay: "0.15s" }} />
      <span className="dot-pulse" style={{ animationDelay: "0.3s" }} />
    </span>
  );
}
