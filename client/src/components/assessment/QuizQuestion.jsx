const TYPE_LABELS = {
  'multiple-choice': 'Multiple Choice',
  'code-output': 'Code Output',
  debugging: 'Debugging',
  conceptual: 'Conceptual',
  scenario: 'Scenario-Based',
  'short-answer': 'Short Answer',
};

export default function QuizQuestion({ question, index, total, answer, onAnswerChange }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <span>
          Question {index + 1} / {total}
        </span>
        <div className="flex gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">Skill: {question.skill}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 capitalize text-slate-600">{question.difficulty}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{TYPE_LABELS[question.type] || question.type}</span>
        </div>
      </div>

      <h2 className="mt-4 whitespace-pre-wrap text-lg font-semibold text-slate-900">{question.question}</h2>

      <div className="mt-6">
        {question.type === 'multiple-choice' ? (
          <div className="space-y-2.5">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onAnswerChange(option)}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  answer === option ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            rows={6}
            placeholder="Type your answer here..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        )}
      </div>
    </div>
  );
}
