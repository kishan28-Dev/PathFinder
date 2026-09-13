import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Rocket } from 'lucide-react';
import Card from '../common/Card';
import ResourceCard from '../common/ResourceCard';
import ResourceGuidanceCard from '../common/ResourceGuidanceCard';

const STATUS_STYLES = {
  completed: { badge: 'bg-emerald-50 text-emerald-700', label: 'Completed' },
  current: { badge: 'bg-brand-50 text-brand-700', label: 'Current' },
  upcoming: { badge: 'bg-slate-100 text-slate-500', label: 'Upcoming' },
};

export default function RoadmapPhase({ phase, onToggleTopic, onToggleResource, onToggleProject }) {
  const [open, setOpen] = useState(phase.status !== 'upcoming');
  const style = STATUS_STYLES[phase.status] || STATUS_STYLES.upcoming;

  return (
    <Card className={phase.status === 'current' ? 'border-brand-300 ring-1 ring-brand-100' : ''}>
      <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setOpen((o) => !o)}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">PHASE {phase.order}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>{style.label}</span>
            {phase.estimatedDuration && <span className="text-xs text-slate-400">{phase.estimatedDuration}</span>}
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900">{phase.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{phase.description}</p>
        </div>
        {open ? <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />}
      </button>

      {open && (
        <div className="mt-5 space-y-6 border-t border-slate-100 pt-5">
          {phase.topics?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Topics</h4>
              <ul className="mt-2 space-y-1.5">
                {phase.topics.map((topic, idx) => (
                  <li key={`${topic.title}-${idx}`}>
                    <button
                      onClick={() => onToggleTopic(idx, !topic.completed)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span className={topic.completed ? 'text-slate-400 line-through' : 'text-slate-700'}>{topic.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.practiceTasks?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Practice</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                {phase.practiceTasks.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </div>
          )}

          {(phase.resources?.length > 0 || phase.resourceGuidance?.length > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Resources</h4>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {phase.resources?.map((r) => (
                  <ResourceCard
                    key={r.resource?._id || r.resource}
                    resource={r.resource}
                    isBest={r.isBest}
                    reason={r.reason}
                    completed={r.completed}
                    onToggleComplete={() => onToggleResource(r.resource?._id || r.resource, !r.completed)}
                  />
                ))}
                {phase.resourceGuidance?.map((g) => (
                  <ResourceGuidanceCard key={g.skill} skill={g.skill} guidance={g.guidance} suggestedSearchTerms={g.suggestedSearchTerms} />
                ))}
              </div>
            </div>
          )}

          {phase.project && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-brand-600" />
                  <h4 className="font-semibold text-slate-900">Project: {phase.project.title}</h4>
                </div>
                <button onClick={() => onToggleProject(!phase.project.completed)} className="shrink-0 text-slate-400 hover:text-brand-600">
                  {phase.project.completed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">{phase.project.description}</p>
              {phase.project.requirements?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Requirements</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {phase.project.requirements.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {phase.project.bonusFeatures?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bonus Features</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {phase.project.bonusFeatures.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="capitalize">{phase.project.difficulty}</span>
                {phase.project.estimatedTime && <span>· {phase.project.estimatedTime}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
