export default function StepIndicator({ step, totalSteps, labels }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {labels.map((label, idx) => {
          const num = idx + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {idx > 0 && <div className={`h-0.5 flex-1 ${isDone || isActive ? 'bg-brand-600' : 'bg-slate-200'}`} />}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isDone ? 'bg-brand-600 text-white' : isActive ? 'border-2 border-brand-600 text-brand-600' : 'border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {num}
                </div>
                {idx < labels.length - 1 && <div className={`h-0.5 flex-1 ${isDone ? 'bg-brand-600' : 'bg-slate-200'}`} />}
              </div>
              <span className={`mt-2 text-center text-xs font-medium ${isActive ? 'text-brand-700' : 'text-slate-400'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
