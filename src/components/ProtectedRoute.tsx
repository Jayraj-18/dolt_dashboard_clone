import { ReactNode } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-primary-dark animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {

    navigate('/');
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user has the capability for the role but isn't currently switched to it, send to selection
    if (
      (allowedRoles.includes('provider') && user.isAlsoProvider) ||
      (allowedRoles.includes('user') && user.isAlsoUser)
    ) {
      // Prevent infinite loop if we are already at select-role (though select-role shouldn't have specific allowedRoles usually, or just 'any')
      return <Navigate to="/select-role" replace />;
    }

    // Otherwise, truly unauthorized for this route
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
