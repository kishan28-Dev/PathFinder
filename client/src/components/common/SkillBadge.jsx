const STATUS_STYLES = {
  strong: { label: 'Strong', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'needs-improvement': { label: 'Needs Improvement', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  missing: { label: 'Missing / Beginner', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

export default function SkillBadge({ skill, status, score, className = '' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.missing;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text} ${className}`}
      title={style.label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {skill}
      {typeof score === 'number' && <span className="opacity-70">· {score}%</span>}
    </span>
  );
}
