import { ExternalLink, CheckCircle2, Circle } from 'lucide-react';

const TYPE_LABELS = {
  video: 'Video',
  course: 'Course',
  documentation: 'Documentation',
  article: 'Article',
  tutorial: 'Tutorial',
  practice: 'Practice',
  project: 'Project',
};

export default function ResourceCard({ resource, isBest, reason, completed, onToggleComplete }) {
  if (!resource) return null;

  return (
    <div className={`rounded-xl border p-4 ${isBest ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-white'}`}>
      {isBest && <p className="mb-2 text-xs font-bold text-brand-600">🏆 BEST FREE RESOURCE</p>}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900">{resource.title}</h4>
          <p className="text-xs text-slate-500">{resource.provider}</p>
        </div>
        {onToggleComplete && (
          <button onClick={onToggleComplete} className="shrink-0 text-slate-400 hover:text-brand-600" aria-label="Toggle complete">
            {completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{TYPE_LABELS[resource.type] || resource.type}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize text-slate-600">{resource.level}</span>
        {resource.isFree && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">FREE</span>}
        {resource.duration && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{resource.duration}</span>}
      </div>

      {resource.description && <p className="mt-2 text-sm text-slate-500">{resource.description}</p>}

      {reason && (
        <p className="mt-2 rounded-lg bg-white/70 p-2 text-xs italic text-slate-500">
          Why this: {reason}
        </p>
      )}

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        Start Learning <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
