export default function ProgressBar({ value = 0, className = '', trackClassName = '', barClassName = '' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full bg-brand-600 transition-all duration-500 ${barClassName}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
