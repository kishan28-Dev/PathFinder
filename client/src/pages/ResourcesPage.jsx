import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import Card from '../components/common/Card';
import ResourceCard from '../components/common/ResourceCard';
import ResourceGuidanceCard from '../components/common/ResourceGuidanceCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRecommendedResources, getResources } from '../services/resourceApi';
import { getErrorMessage } from '../services/api';

const TYPE_OPTIONS = ['', 'video', 'course', 'documentation', 'article', 'tutorial', 'practice', 'project'];

export default function ResourcesPage() {
  const [recommended, setRecommended] = useState(null);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  const [catalog, setCatalog] = useState({ items: [], totalPages: 1 });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [type, setType] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    getRecommendedResources()
      .then(setRecommended)
      .catch(() => setRecommended({ items: [] }))
      .finally(() => setRecommendedLoading(false));
  }, []);

  useEffect(() => {
    setCatalogLoading(true);
    setError('');
    const params = { page, limit: 12 };
    if (type) params.type = type;
    if (freeOnly) params.isFree = true;

    getResources(params)
      .then(setCatalog)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setCatalogLoading(false));
  }, [type, freeOnly, page]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
        <p className="mt-1 text-sm text-slate-500">Based on your most recent assessment's weakest skills.</p>

        {recommendedLoading && <LoadingSpinner className="mt-6" label="Finding your best resources..." />}

        {!recommendedLoading && !recommended?.items?.length && !recommended?.guidance?.length && (
          <EmptyState
            className="mt-6"
            icon={BookOpen}
            title="No recommendations yet"
            description={recommended?.message || 'Take an assessment to get resources tailored to your skill gaps.'}
          />
        )}

        {!recommendedLoading && (recommended?.items?.length > 0 || recommended?.guidance?.length > 0) && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.items.map(({ skill, resource, reason }) => (
              <ResourceCard key={`${skill}-${resource._id}`} resource={resource} isBest reason={reason} />
            ))}
            {recommended.guidance?.map((g) => (
              <ResourceGuidanceCard key={g.skill} skill={g.skill} guidance={g.guidance} suggestedSearchTerms={g.suggestedSearchTerms} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">Browse All Resources</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t ? t[0].toUpperCase() + t.slice(1) : 'All Types'}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => {
                  setFreeOnly(e.target.checked);
                  setPage(1);
                }}
              />
              Free only
            </label>
          </div>
        </div>

        {catalogLoading && <LoadingSpinner className="mt-6" label="Loading resources..." />}
        {error && <ErrorState message={error} />}

        {!catalogLoading && !error && catalog.items.length === 0 && (
          <EmptyState className="mt-6" icon={BookOpen} title="No resources match these filters" />
        )}

        {!catalogLoading && catalog.items.length > 0 && (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.items.map((r) => (
                <ResourceCard key={r._id} resource={r} />
              ))}
            </div>
            {catalog.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {page} of {catalog.totalPages}
                </span>
                <button
                  disabled={page >= catalog.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
