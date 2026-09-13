import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import CyclingLoadingMessage from '../components/common/CyclingLoadingMessage';
import QuizQuestion from '../components/assessment/QuizQuestion';
import SkillGapCard from '../components/common/SkillGapCard';
import { useProfile } from '../context/ProfileContext';
import { generateAssessment, submitAssessment, getAssessmentHistory } from '../services/assessmentApi';
import { generateRoadmap } from '../services/roadmapApi';
import { getErrorMessage } from '../services/api';

const GENERATING_MESSAGES = [
  'Analyzing your target career...',
  'Calibrating questions to your current skills...',
  'Preparing your personalized assessment...',
];

const EVALUATING_MESSAGES = [
  'Grading your answers...',
  'Analyzing your current skills...',
  'Identifying skill gaps...',
];

export default function AssessmentPage() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('intro'); // intro | generating | in-progress | confirm | evaluating | results | error
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState(null); // { assessmentId, questions }
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [isReassessmentFlow, setIsReassessmentFlow] = useState(false);
  const [previousScores, setPreviousScores] = useState(null);

  const hasCareerGoal = !!(profile?.targetCareer || profile?.customCareerName);

  const startAssessment = async (type) => {
    setPhase('generating');
    setError('');
    setIsReassessmentFlow(type === 'reassessment');
    try {
      const data = await generateAssessment({ type });
      setAssessment(data);
      setAnswers({});
      setIndex(0);
      setPhase('in-progress');
    } catch (err) {
      setError(getErrorMessage(err));
      setPhase('error');
    }
  };

  const currentQuestion = assessment?.questions?.[index];
  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;

  const handleSubmit = async () => {
    setPhase('evaluating');
    try {
      const payload = {
        assessmentId: assessment.assessmentId,
        answers: assessment.questions.map((q) => ({ questionId: q.questionId, answer: answers[q.questionId] || '' })),
      };
      const data = await submitAssessment(payload);
      setResult(data);

      if (isReassessmentFlow) {
        try {
          const history = await getAssessmentHistory();
          // history is sorted newest first; the entry after the one we just created
          // (if any) is the prior attempt to compare against.
          const previous = history.find((h) => h._id !== data.resultId);
          if (previous) {
            setPreviousScores(new Map(previous.skillScores.map((s) => [s.skill, s.score])));
          }
        } catch {
          // Comparison is a nice-to-have; missing history shouldn't block showing results.
        }
      }

      setPhase('results');
    } catch (err) {
      setError(getErrorMessage(err));
      setPhase('error');
    }
  };

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      await generateRoadmap();
      navigate('/roadmap');
    } catch (err) {
      setError(getErrorMessage(err));
      setRoadmapLoading(false);
    }
  };

  if (!hasCareerGoal) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Choose a career goal first"
        description="We need to know what you're working toward before we can generate a meaningful assessment."
        action={<Button onClick={() => navigate('/onboarding')}>Complete Onboarding</Button>}
      />
    );
  }

  if (phase === 'generating') return <CyclingLoadingMessage messages={GENERATING_MESSAGES} />;
  if (phase === 'evaluating') return <CyclingLoadingMessage messages={EVALUATING_MESSAGES} />;

  if (phase === 'error') {
    return <ErrorState message={error} onRetry={() => setPhase('intro')} />;
  }

  if (phase === 'intro') {
    const isReassessment = !!profile?.currentRoadmap;
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={ClipboardCheck}
          title={isReassessment ? 'Reassess your skills' : 'Take your skill assessment'}
          description={
            isReassessment
              ? "See how much you've grown since your last assessment. We'll compare your new scores to your previous ones."
              : "We'll generate a mixed set of questions calibrated to your target career and self-reported skills. It takes about 10-15 minutes."
          }
          action={
            <Button onClick={() => startAssessment(isReassessment ? 'reassessment' : 'initial')}>
              {isReassessment ? 'Reassess My Skills' : 'Start Assessment'}
            </Button>
          }
        />
      </div>
    );
  }

  if (phase === 'results' && result) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Overall Score</p>
              <p className="text-4xl font-bold text-slate-900">{result.overallScore}%</p>
            </div>
            <div className="max-w-sm text-sm text-slate-600">
              <p className="font-medium text-slate-800">Recommended starting point</p>
              <p className="mt-1">{result.recommendedStartingPoint}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900">Skill-by-Skill Breakdown</h3>
          <div className="mt-4 space-y-3">
            {result.skillScores.map((s) => {
              const prev = previousScores?.get(s.skill);
              const delta = typeof prev === 'number' ? s.score - prev : null;
              return (
                <div key={s.skill}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{s.skill}</span>
                    <span className="text-slate-500">
                      {typeof prev === 'number' && <span className="mr-1.5 text-xs text-slate-400">{prev}% →</span>}
                      {s.score}%
                      {delta !== null && delta !== 0 && (
                        <span className={`ml-1.5 text-xs font-semibold ${delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {delta > 0 ? '+' : ''}
                          {delta}
                        </span>
                      )}
                    </span>
                  </div>
                  <ProgressBar value={s.score} className="mt-1.5" />
                </div>
              );
            })}
          </div>
        </Card>

        <SkillGapCard skillGap={result.skillGap} />

        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Ready for your personalized roadmap?</p>
            <p className="mt-1 text-sm text-slate-500">We'll build a phased learning path around exactly what you need next.</p>
          </div>
          <Button onClick={handleGenerateRoadmap} loading={roadmapLoading}>
            <Sparkles className="h-4 w-4" /> Generate My Roadmap
          </Button>
        </Card>
      </div>
    );
  }

  if ((phase === 'in-progress' || phase === 'confirm') && currentQuestion) {
    const total = assessment.questions.length;
    const isLast = index === total - 1;

    return (
      <div className="mx-auto max-w-2xl">
        <ProgressBar value={((index + 1) / total) * 100} className="mb-6" />
        <Card>
          <QuizQuestion
            question={currentQuestion}
            index={index}
            total={total}
            answer={answers[currentQuestion.questionId]}
            onAnswerChange={(val) => setAnswers((a) => ({ ...a, [currentQuestion.questionId]: val }))}
          />

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            {isLast ? (
              <Button onClick={() => setPhase('confirm')}>Submit Assessment</Button>
            ) : (
              <Button onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        <Modal
          open={phase === 'confirm'}
          onClose={() => setPhase('in-progress')}
          title="Submit assessment?"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPhase('in-progress')}>
                Keep Reviewing
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </>
          }
        >
          <p>
            You've answered {answeredCount} of {total} questions. Once submitted, you won't be able to change your answers.
          </p>
        </Modal>
      </div>
    );
  }

  return null;
}
