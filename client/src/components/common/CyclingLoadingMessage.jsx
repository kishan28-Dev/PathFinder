import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Rotates through a list of status messages so a genuinely slow AI call (assessment
// generation, evaluation, roadmap generation) never reads as a frozen screen.
export default function CyclingLoadingMessage({ messages, intervalMs = 1800 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(timer);
  }, [messages, intervalMs]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <p className="text-sm font-medium text-slate-600">{messages[index]}</p>
    </div>
  );
}
