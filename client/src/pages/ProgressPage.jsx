import { useEffect, useState } from 'react';
import { TrendingUp, Flame, CheckCircle2, Circle, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getProgress } from '../services/progressApi';
import { getRoadmap } from '../services/roadmapApi';
import { getAssessmentHistory } from '../services/assessmentApi';
import { useProfile } from '../context/ProfileContext';
import { getErrorMessage } from '../services/api';

const PHASE_STATUS_ICON = {
  completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  current: <Clock className="h-5 w-5 text-brand-600" />,
  upcoming: <Circle className="h-5 w-5 text-slate-300" />,
};

export default function ProgressPage() {
  const { profile } = useProfile();
  const [progress, setProgress] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProgress(), getRoadmap(), getAssessmentHistory()])
      .then(([p, r, h]) => {
        setProgress(p);
        setRoadmap(r);
        setHistory(h);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen label="Loading your progress..." />;
  if (error) return <ErrorState message={error} />;

  if (!progress || !roadmap) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Start your first topic to begin tracking progress"
        description="Once you have a roadmap, completing topics, resources, and projects will show up here."
      />
    );
  }

  const latestSkillScores = history[0]?.skillScores || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Overall Progress</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{progress.overallProgress}%</p>
          <ProgressBar value={progress.overallProgress} className="mt-3" />
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Learning Streak</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <Flame className="h-6 w-6 text-orange-500" /> {profile?.streak?.current ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-400">Longest: {profile?.streak?.longest ?? 0} days</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Projects Completed</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {progress.completedProjects.length} / {roadmap.phases.length}
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900">Roadmap Phase Progress</h3>
        <ul className="mt-4 space-y-3">
          {roadmap.phases.map((phase) => (
            <li key={phase.order} className="flex items-center gap-3">
              {PHASE_STATUS_ICON[phase.status]}
              <span className={`text-sm ${phase.status === 'upcoming' ? 'text-slate-400' : 'text-slate-700'}`}>
                Phase {phase.order}: {phase.title}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {latestSkillScores.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900">Skill Progress (Most Recent Assessment)</h3>
          <div className="mt-4 space-y-3">
            {latestSkillScores.map((s) => (
              <div key={s.skill}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{s.skill}</span>
                  <span className="text-slate-500">{s.score}%</span>
                </div>
                <ProgressBar value={s.score} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900">Quiz Score History</h3>
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((h) => (
              <li key={h._id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-500">{new Date(h.createdAt).toLocaleDateString()}</span>
                <span className="font-semibold text-slate-800">{h.overallScore}%</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
