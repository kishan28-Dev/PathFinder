import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getProfile } from '../services/profileApi';
import { getErrorMessage } from '../services/api';

const ProfileContext = createContext(null);

// Loads the CareerPath AI profile (separate from Clerk's own user object) once per
// signed-in session and shares it across onboarding, dashboard, and profile pages so
// they don't each re-fetch it independently.
export function ProfileProvider({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      refresh();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, refresh]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading, error, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
