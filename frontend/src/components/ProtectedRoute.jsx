import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/login',
}) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
