import { useEffect, useState } from 'react';
import { Search, Check, Compass } from 'lucide-react';
import { getCareers } from '../../services/careerApi';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

export default function CareerGoalStep({ value, onChange }) {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(!!value.customCareerName);

  const load = () => {
    setLoading(true);
    setError('');
    getCareers()
      .then(setCareers)
      .catch(() => setError('Could not load careers. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = careers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const selectCareer = (career) => {
    onChange({ targetCareer: career._id, customCareerName: '', careerName: career.name, careerSlug: career.slug });
    setShowCustom(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">What do you want to become?</h2>
      <p className="mt-1 text-sm text-slate-500">Pick a career path, or tell us something else if you don't see it here.</p>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search careers..."
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {loading && <LoadingSpinner className="mt-8" label="Loading careers..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && careers.length === 0 && (
        <EmptyState
          className="mt-6"
          icon={Compass}
          title="No career paths are set up yet"
          description="The career catalog looks empty on the backend (it needs to be seeded). You can still continue with 'Something else' below, or ask whoever set up this app to run the database seed script."
        />
      )}

      {!loading && !error && careers.length > 0 && filtered.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">No careers match "{search}". Try a different search, or use "Something else" below.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((career) => {
            const isSelected = value.targetCareer === career._id;
            return (
              <button
                key={career._id}
                type="button"
                onClick={() => selectCareer(career)}
                className={`relative rounded-xl border p-4 text-left transition-colors ${
                  isSelected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <h3 className="pr-6 font-semibold text-slate-900">{career.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{career.description}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => {
            setShowCustom(true);
            onChange({ targetCareer: null, customCareerName: value.customCareerName || '', careerName: '', careerSlug: '' });
          }}
          className={`text-sm font-semibold ${showCustom ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Something else? Tell us what you're aiming for →
        </button>
        {showCustom && (
          <input
            type="text"
            value={value.customCareerName}
            onChange={(e) => onChange({ targetCareer: null, customCareerName: e.target.value, careerName: '', careerSlug: '' })}
            placeholder="e.g. Game Developer, Product Manager, DevOps Engineer"
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        )}
      </div>
    </div>
  );
}
