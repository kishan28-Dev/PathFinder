import Card from './Card';

const GROUPS = [
  { key: 'strong', emoji: '🟢', title: 'Strong', hint: 'You already have solid command of these.' },
  { key: 'needsImprovement', emoji: '🟡', title: 'Needs Improvement', hint: 'You have some exposure, but there are gaps.' },
  { key: 'missing', emoji: '🔴', title: 'Missing / Beginner', hint: "You'll need to build these from the ground up." },
];

export default function SkillGapCard({ skillGap, title = 'Skill Gap Analysis' }) {
  if (!skillGap) return null;
  const detailByName = new Map((skillGap.details || []).map((d) => [d.skill, d]));

  return (
    <Card>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {GROUPS.map((group) => {
          const items = skillGap[group.key] || [];
          return (
            <div key={group.key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-sm font-semibold text-slate-700">
                {group.emoji} {group.title} <span className="text-slate-400">({items.length})</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">{group.hint}</p>
              <ul className="mt-3 space-y-1.5">
                {items.length === 0 && <li className="text-xs text-slate-400">None</li>}
                {items.map((skill) => {
                  const score = detailByName.get(skill)?.score;
                  return (
                    <li key={skill} className="flex items-center justify-between text-sm text-slate-700">
                      <span>{skill}</span>
                      {typeof score === 'number' && <span className="text-xs text-slate-400">{score}%</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
