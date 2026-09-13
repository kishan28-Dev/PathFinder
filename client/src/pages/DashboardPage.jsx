import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Target,
  TrendingUp,
  Layers,
  Map,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ClipboardCheck,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResourceCard from '../components/common/ResourceCard';
import { useProfile } from '../context/ProfileContext';
import { getRoadmap } from '../services/roadmapApi';
import { getProgress } from '../services/progressApi';
import { getRecommendedResources } from '../services/resourceApi';
import { getAssessmentHistory } from '../services/assessmentApi';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useUser();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourcesGuidanceCount, setResourcesGuidanceCount] = useState(0);
  const [resourcesMessage, setResourcesMessage] = useState('');
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRoadmap(), getProgress(), getRecommendedResources(), getAssessmentHistory()])
      .then(([r, p, res, history]) => {
        setRoadmap(r);
        setProgress(p);
        setResources(res.items || []);
        setResourcesGuidanceCount(res.guidance?.length || 0);
        setResourcesMessage(res.message || '');
        setLatestAssessment(history[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen label="Loading your dashboard..." />;

  const careerName = profile?.targetCareer?.name || profile?.customCareerName || 'Not set';
  const currentPhase = roadmap?.phases.find((p) => p.status === 'current');
  const nextTopic = currentPhase?.topics.find((t) => !t.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting()}, {user?.firstName || 'there'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here's your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 text-slate-400">
            <Target className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Target Career</span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">{careerName}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Overall Progress</span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">{progress?.overallProgress ?? 0}%</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Skill Level</span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">{roadmap?.startingLevel || 'Not assessed'}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-slate-400">
            <Map className="h-4 w-4" /> <span className="text-xs font-medium uppercase tracking-wide">Current Phase</span>
          </div>
          <p className="mt-2 truncate text-lg font-bold text-slate-900">{currentPhase?.title || '—'}</p>
        </Card>
      </div>

      {!roadmap ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Take your first assessment to discover your current skill level"
          description="Once we know where you're starting from, we'll build a roadmap around exactly what you need."
          action={<Button onClick={() => navigate('/assessment')}>Start Assessment</Button>}
        />
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Continue Learning</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{currentPhase?.title || 'Roadmap complete!'}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {nextTopic ? `Next up: ${nextTopic.title}` : 'All topics in this phase are done — check the project.'}
              </p>
            </div>
            <Button onClick={() => navigate('/roadmap')}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {progress && <ProgressBar value={progress.overallProgress} className="mt-4" />}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-slate-900">Skill Overview</h3>
          {latestAssessment ? (
            <div className="mt-4 space-y-3">
              {latestAssessment.skillScores.map((s) => (
                <div key={s.skill}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.skill}</span>
                    <span className="text-slate-500">{s.score}%</span>
                  </div>
                  <ProgressBar value={s.score} className="mt-1.5" />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No assessment data yet.</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900">Recent Assessment</h3>
          {latestAssessment ? (
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{latestAssessment.overallScore}%</p>
              <p className="mt-1 text-sm text-slate-500">{new Date(latestAssessment.createdAt).toLocaleDateString()}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/assessment')}>
                Reassess My Skills
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Take your first assessment to see results here.</p>
          )}
        </Card>
      </div>

      {roadmap && (
        <Card>
          <h3 className="font-semibold text-slate-900">Roadmap</h3>
          <ul className="mt-4 space-y-2">
            {roadmap.phases.map((phase) => (
              <li key={phase.order} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    phase.status === 'completed' ? 'bg-emerald-500' : phase.status === 'current' ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                />
                <span className={phase.status === 'upcoming' ? 'text-slate-400' : 'text-slate-700'}>
                  Phase {phase.order}: {phase.title}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold text-slate-900">Recommended Resources</h3>
        {resources.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            {resourcesGuidanceCount > 0 ? (
              <>
                We don't have verified free resources cataloged for your current focus areas yet, but there's AI search
                guidance waiting on the{' '}
                <button onClick={() => navigate('/resources')} className="font-medium text-brand-600 hover:underline">
                  Resources page
                </button>
                .
              </>
            ) : (
              resourcesMessage || 'Take an assessment to get personalized resource picks.'
            )}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources.slice(0, 3).map(({ skill, resource, reason }) => (
              <ResourceCard key={`${skill}-${resource._id}`} resource={resource} isBest reason={reason} />
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Stuck on something?</p>
            <p className="text-sm text-slate-500">Ask your AI mentor for help.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate('/mentor')}>
          <Sparkles className="h-4 w-4" /> Open AI Mentor
        </Button>
      </Card>
    </div>
  );
}
