export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="spinner-wrap">
      <span className="spinner" aria-hidden="true" />
      <p>{label}…</p>
    </div>
  );
}