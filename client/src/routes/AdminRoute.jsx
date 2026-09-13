import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminRoute() {
  const { profile, loading } = useProfile();

  if (loading) return <LoadingSpinner fullScreen label="Checking access..." />;
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
