import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import StepIndicator from '../components/onboarding/StepIndicator';
import AboutYouStep from '../components/onboarding/AboutYouStep';
import CareerGoalStep from '../components/onboarding/CareerGoalStep';
import CurrentSkillsStep from '../components/onboarding/CurrentSkillsStep';
import LearningPreferencesStep from '../components/onboarding/LearningPreferencesStep';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { updateProfile } from '../services/profileApi';
import { useProfile } from '../context/ProfileContext';
import { getErrorMessage } from '../services/api';

const STEP_LABELS = ['About You', 'Career Goal', 'Current Skills', 'Preferences'];

const INITIAL_STATE = {
  aboutYou: { educationLevel: '', currentRole: '', experienceLevel: '', learningGoal: '' },
  career: { targetCareer: null, customCareerName: '', careerName: '', careerSlug: '' },
  skills: [],
  preferences: { hoursPerWeek: 10, learningFormat: [], resourcePreference: 'only-free' },
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setProfile } = useProfile();

  const canProceed = () => {
    if (step === 1) return data.aboutYou.educationLevel && data.aboutYou.experienceLevel && data.aboutYou.learningGoal;
    if (step === 2) return !!data.career.targetCareer || data.career.customCareerName.trim().length > 0;
    if (step === 3) return true; // skills are optional — a complete beginner may select none
    if (step === 4) return data.preferences.learningFormat.length > 0 && data.preferences.resourcePreference;
    return false;
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const updated = await updateProfile({
        aboutYou: data.aboutYou,
        targetCareer: data.career.targetCareer,
        customCareerName: data.career.customCareerName,
        skills: data.skills,
        preferences: data.preferences,
        onboardingCompleted: true,
      });
      setProfile(updated);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <StepIndicator step={step} totalSteps={4} labels={STEP_LABELS} />

        <Card className="p-6 sm:p-8">
          {step === 1 && <AboutYouStep value={data.aboutYou} onChange={(aboutYou) => setData((d) => ({ ...d, aboutYou }))} />}

          {step === 2 && (
            <CareerGoalStep
              value={data.career}
              onChange={(partial) => setData((d) => ({ ...d, career: { ...d.career, ...partial } }))}
            />
          )}

          {step === 3 && (
            <CurrentSkillsStep
              careerSlug={data.career.careerSlug}
              isCustomCareer={!data.career.targetCareer}
              selectedSkills={data.skills}
              onChange={(skills) => setData((d) => ({ ...d, skills }))}
            />
          )}

          {step === 4 && (
            <LearningPreferencesStep value={data.preferences} onChange={(preferences) => setData((d) => ({ ...d, preferences }))} />
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || submitting}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()} loading={submitting}>
              {step === 4 ? 'Finish' : 'Continue'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
