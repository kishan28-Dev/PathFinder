import { Search, Sparkles } from 'lucide-react';

// Shown only when our verified resource catalog has nothing for a skill. Deliberately
// styled and labeled so it can never be mistaken for a verified ResourceCard — it's
// AI-generated search guidance, not a link to a real, checked resource.
export default function ResourceGuidanceCard({ skill, guidance, suggestedSearchTerms }) {
  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
        <Sparkles className="h-3.5 w-3.5" /> AI SUGGESTION — NOT A VERIFIED LINK
      </p>
      <h4 className="mt-2 font-semibold text-slate-900">{skill}</h4>
      <p className="mt-1.5 text-sm text-slate-600">{guidance}</p>

      {suggestedSearchTerms?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500">Try searching:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {suggestedSearchTerms.map((term) => (
              <span key={term} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                <Search className="h-3 w-3" /> {term}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs italic text-amber-700/80">
        We don't have a verified free resource for this skill yet — vet whatever you find before relying on it.
      </p>
    </div>
  );
}
