import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SkillBadge from '../components/common/SkillBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LearningPreferencesStep from '../components/onboarding/LearningPreferencesStep';
import { useProfile } from '../context/ProfileContext';
import { updateProfile } from '../services/profileApi';
import { getAssessmentHistory } from '../services/assessmentApi';
import { getErrorMessage } from '../services/api';

function scoreToLevelLabel(level) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export default function ProfilePage() {
  const { user } = useUser();
  const { profile, loading, setProfile } = useProfile();
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (profile) setPreferences(profile.preferences);
    getAssessmentHistory().then(setHistory).catch(() => setHistory([]));
  }, [profile]);

  const savePreferences = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const updated = await updateProfile({ preferences });
      setProfile(updated);
      setSaveMessage('Preferences saved.');
    } catch (err) {
      setSaveMessage(getErrorMessage(err));
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  if (loading || !profile || !preferences) return <LoadingSpinner fullScreen label="Loading your profile..." />;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-semibold text-slate-900">Account</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Name</p>
            <p className="text-sm font-medium text-slate-800">{user?.fullName || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="text-sm font-medium text-slate-800">{user?.primaryEmailAddress?.emailAddress || '—'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Career Goal</h2>
        <p className="mt-2 text-sm text-slate-700">{profile.targetCareer?.name || profile.customCareerName || 'Not set'}</p>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.skills.length === 0 && <p className="text-sm text-slate-400">No skills recorded yet.</p>}
          {profile.skills.map((s) => (
            <SkillBadge
              key={s.skill?._id || s.skill}
              skill={s.skill?.name || 'Unknown skill'}
              status={s.level === 'advanced' || s.level === 'expert' ? 'strong' : s.level === 'intermediate' ? 'needs-improvement' : 'missing'}
              score={undefined}
              className="capitalize"
            />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Learning Preferences</h2>
        <div className="mt-4">
          <LearningPreferencesStep value={preferences} onChange={setPreferences} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={savePreferences} loading={saving}>Save Preferences</Button>
          {saveMessage && <span className="text-sm text-slate-500">{saveMessage}</span>}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Assessment History</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No assessments taken yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {history.map((h) => (
              <li key={h._id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-500">
                  {new Date(h.createdAt).toLocaleDateString()} · {h.assessment?.type === 'reassessment' ? 'Reassessment' : 'Initial'}
                </span>
                <span className="font-semibold text-slate-800">{h.overallScore}%</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
