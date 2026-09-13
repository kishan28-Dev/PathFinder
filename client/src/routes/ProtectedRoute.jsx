import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ProfileProvider } from '../context/ProfileContext';

// Gates every authenticated route on a verified Clerk session. The frontend check
// alone is a UX convenience — every protected API call is independently verified by
// the backend (see server/middleware/auth.js), so this is not the real security
// boundary, just what keeps signed-out users from seeing app screens at all.
export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) return <LoadingSpinner fullScreen label="Loading..." />;
  if (!isSignedIn) return <Navigate to="/sign-in" state={{ from: location }} replace />;

  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  );
}
