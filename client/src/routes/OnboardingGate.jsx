import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

// Ensures a signed-in user finishes onboarding before reaching the main app shell.
export default function OnboardingGate() {
  const { profile, loading, error, refresh } = useProfile();

  if (loading) return <LoadingSpinner fullScreen label="Loading your profile..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (profile && !profile.onboardingCompleted) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
