import PillOption from './PillOption';

const FORMAT_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'interactive', label: 'Interactive practice' },
  { value: 'projects', label: 'Projects' },
  { value: 'combination', label: 'A combination' },
];

const COST_OPTIONS = [
  { value: 'only-free', label: 'Only free resources' },
  { value: 'mostly-free', label: 'Mostly free' },
  { value: 'any', label: 'Any resources' },
];

const HOURS_OPTIONS = [3, 5, 10, 15, 20];

export default function LearningPreferencesStep({ value, onChange }) {
  const update = (field, val) => onChange({ ...value, [field]: val });

  const toggleFormat = (format) => {
    const current = value.learningFormat || [];
    update('learningFormat', current.includes(format) ? current.filter((f) => f !== format) : [...current, format]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">How do you like to learn?</h2>
        <p className="mt-1 text-sm text-slate-500">We'll use this to prioritize the resources and pacing of your roadmap.</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Hours available per week</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {HOURS_OPTIONS.map((h) => (
            <PillOption key={h} selected={value.hoursPerWeek === h} onClick={() => update('hoursPerWeek', h)}>
              {h} hrs/week
            </PillOption>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Preferred learning format (select all that apply)</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((opt) => (
            <PillOption key={opt.value} selected={(value.learningFormat || []).includes(opt.value)} onClick={() => toggleFormat(opt.value)}>
              {opt.label}
            </PillOption>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Resource cost preference</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {COST_OPTIONS.map((opt) => (
            <PillOption key={opt.value} selected={value.resourcePreference === opt.value} onClick={() => update('resourcePreference', opt.value)}>
              {opt.label}
            </PillOption>
          ))}
        </div>
      </div>
    </div>
  );
}
