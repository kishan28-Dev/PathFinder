import PillOption from './PillOption';

const EDUCATION_OPTIONS = [
  { value: 'high-school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'self-taught', label: 'Self-Taught' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'No experience yet' },
  { value: 'student', label: 'Student' },
  { value: 'early-career', label: 'Early career (0-2 yrs)' },
  { value: 'mid-career', label: 'Mid career (3-7 yrs)' },
  { value: 'senior', label: 'Senior (8+ yrs)' },
];

const GOAL_OPTIONS = [
  { value: 'switch-career', label: 'Switch careers' },
  { value: 'first-job', label: 'Land my first job' },
  { value: 'upskill', label: 'Upskill in my current role' },
  { value: 'promotion', label: 'Get promoted' },
  { value: 'curiosity', label: 'Just curious / exploring' },
];

export default function AboutYouStep({ value, onChange }) {
  const update = (field, val) => onChange({ ...value, [field]: val });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Tell us about you</h2>
        <p className="mt-1 text-sm text-slate-500">This helps us calibrate how we explain things — nothing here is shared publicly.</p>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Education level</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map((opt) => (
            <PillOption key={opt.value} selected={value.educationLevel === opt.value} onClick={() => update('educationLevel', opt.value)}>
              {opt.label}
            </PillOption>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Current role / status</label>
        <input
          type="text"
          value={value.currentRole}
          onChange={(e) => update('currentRole', e.target.value)}
          placeholder="e.g. Computer Science student, Marketing associate, Unemployed"
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">Experience level</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <PillOption key={opt.value} selected={value.experienceLevel === opt.value} onClick={() => update('experienceLevel', opt.value)}>
              {opt.label}
            </PillOption>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-800">What's your learning goal?</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <PillOption key={opt.value} selected={value.learningGoal === opt.value} onClick={() => update('learningGoal', opt.value)}>
              {opt.label}
            </PillOption>
          ))}
        </div>
      </div>
    </div>
  );
}
