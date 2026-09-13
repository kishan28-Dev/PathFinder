import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { getCareerBySlug } from '../../services/careerApi';
import { getSkills } from '../../services/skillApi';
import LoadingSpinner from '../common/LoadingSpinner';

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function CurrentSkillsStep({ careerSlug, isCustomCareer, selectedSkills, onChange }) {
  const [suggested, setSuggested] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const loadAll = getSkills();
    const loadCareer = careerSlug && !isCustomCareer ? getCareerBySlug(careerSlug) : Promise.resolve(null);

    Promise.all([loadAll, loadCareer])
      .then(([skills, career]) => {
        setAllSkills(skills);
        if (career) {
          const combined = [...career.requiredSkills, ...career.recommendedSkills];
          const unique = Array.from(new Map(combined.map((s) => [s._id, s])).values());
          setSuggested(unique);
        } else {
          setSuggested([]);
        }
      })
      .finally(() => setLoading(false));
  }, [careerSlug, isCustomCareer]);

  const selectedMap = useMemo(() => new Map(selectedSkills.map((s) => [s.skill, s.level])), [selectedSkills]);

  const toggleSkill = (skillId) => {
    if (selectedMap.has(skillId)) {
      onChange(selectedSkills.filter((s) => s.skill !== skillId));
    } else {
      onChange([...selectedSkills, { skill: skillId, level: 'beginner' }]);
    }
  };

  const setLevel = (skillId, level) => {
    onChange(selectedSkills.map((s) => (s.skill === skillId ? { ...s, level } : s)));
  };

  const removeSkill = (skillId) => onChange(selectedSkills.filter((s) => s.skill !== skillId));

  const skillById = useMemo(() => new Map(allSkills.map((s) => [s._id, s])), [allSkills]);
  const searchResults = search.length
    ? allSkills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) && !selectedMap.has(s._id)).slice(0, 8)
    : [];

  if (loading) return <LoadingSpinner label="Loading skills..." />;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">What do you already know?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Be honest — this is how we avoid making you re-learn things you already know.
      </p>

      {suggested.length > 0 && (
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-800">Common skills for this path</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggested.map((skill) => (
              <button
                key={skill._id}
                type="button"
                onClick={() => toggleSkill(skill._id)}
                className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                  selectedMap.has(skill._id) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-6">
        <label className="text-sm font-semibold text-slate-800">Add another skill</label>
        <div className="relative mt-3">
          <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills (e.g. Docker, SQL)..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            {searchResults.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => {
                  toggleSkill(s._id);
                  setSearch('');
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="mt-8">
          <label className="text-sm font-semibold text-slate-800">Your self-rated level</label>
          <div className="mt-3 space-y-3">
            {selectedSkills.map(({ skill: skillId, level }) => {
              const skill = skillById.get(skillId) || suggested.find((s) => s._id === skillId);
              if (!skill) return null;
              return (
                <div key={skillId} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeSkill(skillId)} className="text-slate-400 hover:text-red-500" aria-label={`Remove ${skill.name}`}>
                      <X className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-slate-800">{skill.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setLevel(skillId, l.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          level === l.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
