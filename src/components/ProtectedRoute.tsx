import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roles?: string[];
}

function ProtectedRoute({ children, roles }: Props) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Ako su navedene dopuštene uloge, provjeri ima li korisnik jednu od njih
  if (roles && roles.length > 0) {
    const userJson = localStorage.getItem('currentUser');
    const currentUser = userJson ? JSON.parse(userJson) : null;

    if (!currentUser || !roles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;