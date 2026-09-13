import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, RefreshCw, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ProgressBar from '../components/common/ProgressBar';
import CyclingLoadingMessage from '../components/common/CyclingLoadingMessage';
import RoadmapPhase from '../components/roadmap/RoadmapPhase';
import { getRoadmap, generateRoadmap, updateRoadmapProgress } from '../services/roadmapApi';
import { getProgress } from '../services/progressApi';
import { getErrorMessage } from '../services/api';

const ROADMAP_MESSAGES = [
  'Reviewing your skill gaps...',
  'Designing your personalized phases...',
  'Finding the best free resources for you...',
  'Almost ready...',
];

export default function RoadmapPage() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [roadmapData, progressData] = await Promise.all([getRoadmap(), getProgress()]);
      setRoadmap(roadmapData);
      setProgress(progressData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await generateRoadmap();
      setRoadmap(data);
      const progressData = await getProgress();
      setProgress(progressData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const applyUpdate = async (payload) => {
    try {
      const data = await updateRoadmapProgress(payload);
      setRoadmap(data.roadmap);
      setProgress(data.progress);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <CyclingLoadingMessage messages={['Loading your roadmap...']} />;
  if (generating) return <CyclingLoadingMessage messages={ROADMAP_MESSAGES} />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (!roadmap) {
    return (
      <EmptyState
        icon={Map}
        title="You haven't created a roadmap yet"
        description="Complete an assessment first — your roadmap is built around your real skill gaps, not a generic template."
        action={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/assessment')}>Take Assessment</Button>
            <Button onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" /> Generate Roadmap
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{roadmap.careerName}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Your Personalized Roadmap</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{roadmap.summary}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Starting level: <strong className="text-slate-700">{roadmap.startingLevel}</strong></span>
              <span>Estimated duration: <strong className="text-slate-700">{roadmap.estimatedDuration}</strong></span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/assessment')}>
            <RefreshCw className="h-4 w-4" /> Reassess My Skills
          </Button>
        </div>

        {progress && (
          <div className="mt-5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Overall Progress</span>
              <span className="text-slate-500">{progress.overallProgress}%</span>
            </div>
            <ProgressBar value={progress.overallProgress} className="mt-2" />
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {roadmap.phases.map((phase) => (
          <RoadmapPhase
            key={phase.order}
            phase={phase}
            onToggleTopic={(topicIndex, completed) =>
              applyUpdate({ phaseOrder: phase.order, itemType: 'topic', topicIndex, completed })
            }
            onToggleResource={(resourceId, completed) =>
              applyUpdate({ phaseOrder: phase.order, itemType: 'resource', resourceId, completed })
            }
            onToggleProject={(completed) => applyUpdate({ phaseOrder: phase.order, itemType: 'project', completed })}
          />
        ))}
      </div>
    </div>
  );
}
